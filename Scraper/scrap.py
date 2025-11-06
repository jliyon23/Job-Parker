import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import urllib3
import json
import os
from pymongo import MongoClient

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def parse_date_safe(date_str):
    try:
        return datetime.strptime(date_str.strip(), "%d %b %Y")
    except Exception:
        return None

def check_is_fresher(text):
    """Detect if the job is for freshers"""
    text = text.lower()
    fresher_keywords = [
        "fresher", "freshers", "entry level", "graduate trainee",
        "intern", "internship", "trainee", "0-1 year", "0 to 1 year"
    ]
    return any(word in text for word in fresher_keywords)


def scrape_job_description(url, source):
    try:
        res = requests.get(url, timeout=10, verify=False)
        soup = BeautifulSoup(res.text, "html.parser")

        if source == "infopark":
            desc_div = soup.select_one("div.company-detail.career-op .comp-job-deatiil .deatil-box")
        elif source == "cyberpark":
            desc_div = soup.select_one("div.job_description")
        elif source == "technopark":
            desc_div = soup.select_one("div._mce-content-body_silut_1")
        else:
            desc_div = None

        if desc_div:
            return desc_div.get_text(separator=" ", strip=True)[:3000]
        return "Description not found"
    except Exception as e:
        print(f"[ERROR] Description scrape failed for {source}: {e}")
        return "Description not available"

def scrape_company_logo(url, source):
    try:
        res = requests.get(url, timeout=10, verify=False)
        soup = BeautifulSoup(res.text, "html.parser")

        logo_tag = None
        if source == "infopark":
            logo_tag = soup.select_one("div.company-detail.career-op .logo-con img")
        elif source == "cyberpark":
            logo_tag = soup.select_one("img.company_logo")
        elif source == "technopark":
            logo_tag = soup.select_one("div.flex.aspect-square img")

        if logo_tag and logo_tag.get("src"):
            logo = logo_tag["src"].strip()
            if logo.startswith("/"):
                if source == "technopark":
                    logo = "https://technopark.in" + logo
                elif source == "cyberpark":
                    logo = "https://cyberparks.in" + logo
                elif source == "infopark":
                    logo = "https://infopark.in" + logo
            logo = requests.utils.requote_uri(logo)
            if "tp-logo.png" in logo.lower():
                return ""
            return logo
        return ""
    except Exception as e:
        print(f"[ERROR] Logo scrape failed for {source}: {e}")
        return ""

class InfoPark:
    base_url = "https://infopark.in/companies/job-search"
    def get_max_page(self):
        try:
            page = requests.get(self.base_url, verify=False)
            soup = BeautifulSoup(page.content, "html.parser")
            pages = soup.select(".page-link")
            return int(pages[-2].text.strip()) if len(pages) >= 2 else 1
        except Exception:
            return 1
    def get_job_details(self, page_no):
        url = f"{self.base_url}?page={page_no}"
        page = requests.get(url, verify=False)
        soup = BeautifulSoup(page.content, "html.parser")
        rows = soup.select("table.table tr")[1:]
        jobs = []
        for row in rows:
            try:
                cols = row.find_all("td")
                if len(cols) < 5:
                    continue
                posted = cols[0].get_text(strip=True)
                role = cols[1].get_text(strip=True)
                company_name = cols[2].get_text(strip=True)
                last_date_str = cols[3].get_text(strip=True)
                link = cols[-1].find("a")["href"]
                last_date = parse_date_safe(last_date_str)
                if last_date and last_date < datetime.now().replace(hour=0, minute=0, second=0, microsecond=0):
                    continue
                desc = scrape_job_description(link, "infopark")
                logo = scrape_company_logo(link, "infopark")
                jobs.append({
                    "techpark_name": "Infopark",
                    "company_name": company_name,
                    "role": role,
                    "posted": posted,
                    "last_date": last_date_str,
                    "link": link,
                    "logo": logo,
                    "is_fresher": check_is_fresher(role + " " + desc),
                    "description": desc,
                })
            except Exception:
                continue
        return jobs
    def __init__(self):
        max_page = self.get_max_page()
        result = []
        for i in range(1, max_page + 1):
            result.extend(self.get_job_details(i))
            print(f"--Infopark page {i} done - {len(result)} jobs so far")
        self.result = result

class TechnoPark:
    base_url = "https://technopark.org/api/paginated-jobs?page={}"
    def get_max_page(self):
        try:
            res = requests.get(self.base_url.format(1))
            return int(res.json()["last_page"])
        except Exception:
            return 1
    def is_expired(self, url):
        try:
            res = requests.get(url, verify=False)
            soup = BeautifulSoup(res.text, "html.parser")
            txt = soup.get_text(" ", strip=True).lower()
            return "expired" in txt or "closed" in txt
        except Exception:
            return False
    def get_job_details(self, page_no):
        jobs = []
        try:
            res = requests.get(self.base_url.format(page_no)).json()
            data = res.get("data", [])
            for job in data:
                link = f"https://technopark.org/job-details/{job.get('id','')}"
                if self.is_expired(link):
                    continue
                if job.get("closing_date"):
                    closing_date = parse_date_safe(job.get("closing_date").replace(",", ""))
                    if closing_date and closing_date < datetime.now().replace(hour=0, minute=0, second=0, microsecond=0):
                        continue
                company = job.get("company", {}).get("company", "Unknown")
                role = job.get("job_title", "")
                posted = job.get("created_at", "")
                last_date = job.get("closing_date", "")
                desc = scrape_job_description(link, "technopark")
                logo = scrape_company_logo(link, "technopark")
                jobs.append({
                    "techpark_name": "Technopark",
                    "company_name": company,
                    "role": role,
                    "posted": posted,
                    "last_date": last_date,
                    "link": link,
                    "logo": logo,
                    "is_fresher": check_is_fresher(role + " " + desc),
                    "description": desc,
                })
            return jobs
        except Exception:
            return []
    def __init__(self):
        max_page = self.get_max_page()
        result = []
        for i in range(1, max_page + 1):
            result.extend(self.get_job_details(i))
            print(f"--Technopark page {i} done - {len(result)} jobs so far")
        self.result = result

class CyberPark:
    base_url = "https://cyberparks.in/jm-ajax/get_listings?page={}"
    def get_max_page(self):
        try:
            res = requests.get(self.base_url.format(1)).json()
            return int(res["max_num_pages"])
        except Exception:
            return 1
    def get_job_details(self, page_no):
        jobs = []
        try:
            res = requests.get(self.base_url.format(page_no)).json()
            soup = BeautifulSoup(res.get("html", ""), "html.parser")
            for li in soup.select("li.job_listing"):
                try:
                    link = li.find("a")["href"]
                    role = li.find("h3").text.strip()
                    company = li.find("strong").text.strip()
                    posted_str = li.find("time")["datetime"] if li.find("time") else ""
                    try:
                        posted_date = datetime.strptime(posted_str, "%Y-%m-%d")
                        if posted_date < datetime.now() - timedelta(days=90):
                            continue
                    except:
                        pass
                    desc = scrape_job_description(link, "cyberpark")
                    logo = scrape_company_logo(link, "cyberpark")
                    jobs.append({
                        "techpark_name": "Cyberpark",
                        "company_name": company,
                        "role": role,
                        "posted": posted_str,
                        "last_date": "",
                        "link": link,
                        "logo": logo,
                        "is_fresher": check_is_fresher(role + " " + desc),
                        "description": desc,
                    })
                except:
                    continue
            return jobs
        except:
            return []
    def __init__(self):
        max_page = self.get_max_page()
        result = []
        for i in range(1, max_page + 1):
            result.extend(self.get_job_details(i))
            print(f"--Cyberpark page {i} done - {len(result)} jobs so far")
        self.result = result

if __name__ == "__main__":
    print("🚀 Starting Smart Job Scraper...\n")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://josephliyon23:jliyon2305@liyonproduction.tf8unay.mongodb.net/?appName=liyonproduction")
    client = MongoClient(MONGO_URI)
    db = client["job_scraper_db"]
    collection = db["jobs"]
    collection.create_index("link", unique=True)

    all_jobs = []
    infopark = InfoPark()
    all_jobs.extend(infopark.result)
    technopark = TechnoPark()
    all_jobs.extend(technopark.result)
    cyberpark = CyberPark()
    all_jobs.extend(cyberpark.result)

    print(f"\n----Total jobs scraped: {len(all_jobs)}----")

    inserted, skipped = 0, 0
    for job in all_jobs:
        try:
            collection.insert_one(job)
            inserted += 1
        except:
            skipped += 1

    print(f"\n--MongoDB Inserted: {inserted}, Skipped (duplicates): {skipped}")

    output_path = os.path.join(os.getcwd(), "jobs.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_jobs, f, ensure_ascii=False, indent=2)

    print(f"\nJobs saved to: {output_path}")
