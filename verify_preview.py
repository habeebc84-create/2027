from playwright.sync_api import sync_playwright

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/tmp/verification/videos",
            viewport={"width": 1280, "height": 800}
        )
        page = context.new_page()

        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: errors.append(str(err)))

        print("1. Loading Home Page directly...")
        page.goto("http://localhost:5173/?entered=1")
        page.wait_for_timeout(1000)
        page.screenshot(path="/tmp/verification/screenshots/1_home.png")

        print("2. Navigating to Products page...")
        page.goto("http://localhost:5173/products")
        page.wait_for_timeout(1000)
        page.screenshot(path="/tmp/verification/screenshots/2_products.png")

        print("3. Navigating to Gallery page...")
        page.goto("http://localhost:5173/gallery")
        page.wait_for_timeout(1000)
        page.screenshot(path="/tmp/verification/screenshots/3_gallery.png")

        print("4. Navigating to Terms page...")
        page.goto("http://localhost:5173/terms")
        page.wait_for_timeout(1000)
        page.screenshot(path="/tmp/verification/screenshots/4_terms.png")

        print("5. Navigating to Admin Login page...")
        page.goto("http://localhost:5173/manage-portal-9f3a")
        page.wait_for_timeout(1000)
        page.screenshot(path="/tmp/verification/screenshots/5_admin.png")

        # Final key screenshot
        page.screenshot(path="/tmp/verification/screenshots/verification.png")
        page.wait_for_timeout(1000)

        context.close()
        browser.close()

        print("Console errors count:", len(errors))
        for err in errors:
            print(" - ERROR:", err)

if __name__ == "__main__":
    run_verification()
