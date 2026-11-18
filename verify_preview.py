"""Run against npm run preview -- --port 5173 with isolated, mocked network data."""
import argparse
import json
import re
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright, expect


def run_verification(base_url, screenshots):
    root = Path(__file__).resolve().parent
    product = json.loads(subprocess.check_output(
        ['node', '--input-type=module', '-e', "import { products } from './src/data.js'; console.log(JSON.stringify(products.find(p => p.enabled !== false && !p.sizes?.length) || products[0]));"],
        cwd=root, text=True,
    ))
    failures = []
    attempts = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=shutil.which('chromium'))
        context = browser.new_context(service_workers='block')

        def route_request(route):
            url = urlsplit(route.request.url)
            if url.netloc != urlsplit(base_url).netloc:
                # Isolate the run from the live database, analytics, and hosted content.
                route.fulfill(status=200, content_type='application/json', body='{}')
            elif url.path == '/api/orders':
                payload = route.request.post_data_json
                attempts.append(payload)
                if len(attempts) == 1:
                    route.fulfill(status=429, json={'error': 'Too many orders. Please try again in a minute.'})
                else:
                    order = {
                        'id': 'order-browser-test', 'orderId': 'HSN-BROWSER-TEST',
                        'items': [{'product': {**product, 'price': 450}, 'quantity': 2}],
                        'total': 1010, 'deliveryCharge': 100, 'handlingCharge': 10,
                        'customer': payload['customer'], 'paymentMode': payload['paymentMode'],
                        'deliveryMethod': payload['deliveryMethod'], 'deliveryLocation': payload['deliveryLocation'],
                        'date': '2030-01-01T00:00:00Z', 'status': 'placed', 'timeline': [],
                    }
                    route.fulfill(status=201, json={'order': order, 'orderId': order['orderId'], 'total': order['total'], 'items': []})
            elif url.path.startswith('/api/'):
                route.fulfill(status=200, json={'ok': True})
            else:
                route.continue_()

        context.route('**/*', route_request)
        page = context.new_page()
        page.on('pageerror', lambda error: failures.append(str(error)))
        page.on('console', lambda message: failures.append(message.text) if message.type == 'error' and '429' not in message.text else None)
        page.clock.set_fixed_time(datetime(2026, 11, 1, tzinfo=timezone.utc))
        page.goto(f'{base_url}/?entered=1')
        expect(page.locator('[data-launching-soon]')).to_be_visible()
        page.clock.set_fixed_time(datetime(2030, 1, 1, tzinfo=timezone.utc))
        for path, heading in [
            ('/?entered=1', 'HSN CEMENT AND STEEL'),
            ('/products', 'OUR PRODUCT CATALOG'),
            ('/gallery', 'OUR GALLERY'),
            ('/terms', 'TERMS & CONDITIONS'),
            ('/contact', 'CONTACT HSN CEMENT AND STEEL'),
            ('/checkout', 'YOUR CART IS EMPTY'),
            ('/manage-portal-9f3a', 'ADMIN PORTAL'),
        ]:
            page.goto(base_url + path)
            expect(page.get_by_role('heading', name=re.compile('^' + re.escape(heading) + '$', re.I))).to_be_visible()
            expect(page.locator('[data-launching-soon]')).to_have_count(0)
            if screenshots:
                screenshots.mkdir(parents=True, exist_ok=True)
                page.screenshot(path=str(screenshots / (path.split('?')[0].replace('/', '_') + '.png')))
        page.evaluate('(product) => localStorage.setItem("hsn_cart", JSON.stringify([{product, quantity: 2}]))', product)
        page.goto(base_url + '/checkout')
        page.get_by_placeholder('Contractor / Builder name').fill('Test Customer')
        page.get_by_placeholder('10-digit number').fill('9876543210')
        page.get_by_placeholder('Full site address').fill('Test address')
        page.get_by_placeholder('Near Water Tank / Panchayat Office').fill('Test landmark')
        page.get_by_role('button', name='CONFIRM & PLACE ORDER').click()
        expect(page.get_by_text('Too many orders. Please try again in a minute.', exact=True)).to_be_visible()
        assert page.evaluate('JSON.parse(localStorage.getItem("hsn_cart")).length') == 1
        page.get_by_role('button', name='CONFIRM & PLACE ORDER').click()
        page.wait_for_function('JSON.parse(localStorage.getItem("hsn_cart")).length === 0')
        assert len(attempts) == 2 and attempts[0]['checkoutKey'] == attempts[1]['checkoutKey']
        saved = page.evaluate('JSON.parse(localStorage.getItem("hsn_orders"))[0]')
        assert saved['total'] == 1010 and saved['deliveryCharge'] == 100
        assert saved['id'] == 'order-browser-test'
        context.close()
        browser.close()
    assert not failures, '\n'.join(failures)
    print('Launch gate, seven routes, rejected checkout, retry, and successful checkout passed.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-url', default='http://localhost:5173')
    parser.add_argument('--screenshots', type=Path)
    args = parser.parse_args()
    run_verification(args.base_url.rstrip('/'), args.screenshots)
