"""Real Chromium smoke and negative-control checks against shipped HTML and JS.

Run: python tests/browser_smoke.py
Prerequisites: pip install playwright && playwright install chromium
"""
import copy
import json
import subprocess
import time
from pathlib import Path
from urllib.parse import quote
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = 'http://127.0.0.1:8765/'
ARTIFACTS = ROOT / 'browser-artifacts'


def saved_matchup(page):
    return page.evaluate('JSON.parse(localStorage.getItem("origin-matchup-calculator-v2"))')


def assert_other_side_unchanged(page, saved_side):
    assert saved_matchup(page)['a'] == saved_side, 'Import into B changed Side A'


def planner_snapshot(page):
    return page.evaluate('window.originEntombPlanner.getSnapshot()')


def selected_dino(page, side):
    return page.locator(f'#matchupSide{side} select[data-field="dino"]').input_value()


def assert_import(page, side, expected, mutations):
    """Check selected controls, active chips and serialized snapshot—not dropdown option text."""
    block = f'#matchupSide{side}'
    actual = saved_matchup(page)[side.lower()]
    assert page.locator(f'{block} select[data-field="source"]').input_value() == 'lineage'
    assert selected_dino(page, side) == expected['dino'], f'Side {side} selected dinosaur is wrong'
    assert page.locator(f'{block} select[data-field="generation"]').input_value() == str(expected['generation']), (
        f'Side {side} selected generation is wrong'
    )
    chips = [s.split(' · ')[0].strip() for s in
             page.locator(f'{block} .matchup-mutations .chips .pill').all_text_contents()]
    assert set(chips) == set(mutations), f'Side {side} active mutations {chips} != {mutations}'
    assert actual['dino'] == expected['dino']
    assert actual['generation'] == expected['generation']
    assert actual['lineage'] == expected, f'Side {side} imported an incorrect snapshot'


def assert_planner_unchanged(page, expected):
    assert planner_snapshot(page) == expected, 'Import mutated the visible Entomb Planner'
    assert page.locator('#entombDino').input_value() == expected['dino']
    assert page.locator(
        f'#entombGenerations [data-generation="{expected["generation"]}"]'
    ).get_attribute('aria-pressed') == 'true'


def must_reject(callback, purpose):
    """Deliberately corrupt one observation and prove the guard catches it."""
    try:
        callback()
    except AssertionError:
        return
    raise AssertionError(f'Negative control failed to detect: {purpose}')


def assert_no_horizontal_overflow(page, label):
    widths = page.evaluate("""() => ({
        doc: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
        body: document.body.scrollWidth
    })""")
    assert widths['doc'] <= widths['client'] + 1, f'{label} document overflow: {widths}'
    assert widths['body'] <= widths['client'] + 1, f'{label} body overflow: {widths}'


def assert_readable_content(page, selector):
    width = page.evaluate('document.documentElement.clientWidth')
    for locator in page.locator(selector).all():
        if not locator.is_visible():
            continue
        rect = locator.bounding_box()
        if rect:
            assert rect['x'] >= -1, f'Text starts beyond left viewport: {locator.inner_text()[:40]}'
            assert rect['x'] + rect['width'] <= width + 1, (
                f'Text clipped at right viewport: {locator.inner_text()[:40]}'
            )
            assert locator.evaluate('(el) => parseFloat(getComputedStyle(el).fontSize)') >= 12


def build_lineage(dino, generation, first, third=None):
    lives = [{'prime': False, 'picks': ['', '', '', '']} for _ in range(5)]
    lives[0]['picks'][0] = first
    if third:
        lives[2]['picks'][0] = third
    return {'v': 1, 'dino': dino, 'sex': 'Male',
            'generation': generation, 'contexts': [], 'lives': lives}


def lineage_hash(plan):
    return '#lineage=' + quote(json.dumps(plan), safe='')


server = subprocess.Popen(
    ['python', '-m', 'http.server', '8765', '--bind', '127.0.0.1',
     '--directory', str(ROOT / 'site')],
    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
)
try:
    time.sleep(1)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 850})
        page.set_default_timeout(12000)
        errors = []
        page.on('pageerror', lambda exc: errors.append(str(exc)))
        page.goto(BASE, wait_until='domcontentloaded')
        page.locator('[data-tab="growth"]').click()

        # Preserve v1.0.1 fixes, Prime intent, invalid-value remediation and 50% row.
        assert page.locator('#matchupSideA .matchup-invalid').count() == 0
        page.locator('#matchupSideA [data-field="prime"]').check()
        page.locator('#matchupSideA [data-field="source"]').select_option('none')
        assert page.locator('#matchupSideA [data-field="prime"]').is_checked()
        page.locator('#matchupSideA [data-field="growth"]').fill('74')
        assert 'inactive' in page.locator('#matchupSideA').inner_text()
        page.locator('#matchupSideA [data-field="growth"]').fill('75')
        assert 'active now' in page.locator('#matchupSideA').inner_text()
        page.locator('#matchupSideA [data-field="prime"]').uncheck()
        page.locator('#matchupSideA [data-field="source"]').select_option('standard')
        page.locator('#matchupSideA [data-customize-standard]').click()
        assert page.locator('#matchupSideA select[data-slot="4"]').is_disabled()
        assert page.locator('#matchupSideA [data-clear-retained]').count() == 1
        page.locator('#matchupSideA select[data-slot="3"]').select_option('Accelerated Prey Drive')
        page.locator('#matchupSideA [data-clear-retained]').click()
        assert page.locator('#matchupSideA select[data-slot="4"]').input_value() == ''
        page.locator('#matchupSideA [data-field="prime"]').check()
        page.locator('#matchupSideA [data-field="sex"]').select_option('Female')
        page.locator('#matchupSideA select[data-slot="2"]').select_option('Parthenogenesis')
        page.locator('#matchupSideA [data-field="sex"]').select_option('Male')
        assert page.locator('#matchupSideA select[data-slot="2"]').input_value() == 'Parthenogenesis'
        assert 'EXCLUDED' in page.locator('#matchupSideA select[data-slot="2"] option:checked').inner_text()
        page.locator('#matchupSideA select[data-slot="2"]').select_option('')
        state = saved_matchup(page)
        state['a']['manual'][1] = 'Restored unknown mutation'
        page.evaluate('(value) => localStorage.setItem("origin-matchup-calculator-v2", JSON.stringify(value))', state)
        page.reload(wait_until='domcontentloaded')
        page.locator('[data-tab="growth"]').click()
        assert page.locator('#matchupSideA select[data-slot="2"]').input_value() == 'Restored unknown mutation'
        assert 'EXCLUDED' in page.locator('#matchupSideA select[data-slot="2"] option:checked').inner_text()
        page.locator('#matchupSideA select[data-slot="2"]').select_option('')
        assert page.locator('#matchupGrowthCurve .matchup-curve-row').count() == 9
        assert '50%' in page.locator('#matchupGrowthCurve').inner_text()
        spectrum = page.locator('#matchupResult .matchup-spectrum').inner_text()
        assert spectrum.index('A advantage') < spectrum.index('B advantage')
        print('Baseline controls verified', flush=True)
        # Fight conditions must update saved state, pressure index and the actual marker
        # ONLY when a combatant has a relevant active mutation.
        page.locator('#matchupReset').click()
        def current_ratio():
            return float(page.locator('#matchupResult .matchup-verdict .muted strong').inner_text().replace('×', ''))
        def current_marker():
            return page.locator('#matchupResult .matchup-spectrum-marker').get_attribute('style')
        base_ratio,base_marker=current_ratio(),current_marker()
        assert 'Hemomania' in page.locator('#matchupSideA .matchup-mutations').inner_text(), 'Allosaurus standard preset must include active Hemomania'
        # A bleeding is relevant to B's mutations, not A's. No B Hemomania means no ratio shift.
        page.locator('#matchupConditions [data-condition="aBleeding"]').check()
        assert saved_matchup(page)['scenario']['aBleeding'] is True
        assert current_ratio()==base_ratio
        assert 'no modeled score change' in page.locator('#matchupResult .matchup-condition-feedback').inner_text()
        page.locator('#matchupConditions [data-condition="aBleeding"]').uncheck()
        # B bleeding activates A's Hemomania and moves the marker left.
        page.locator('#matchupConditions [data-condition="bBleeding"]').check()
        assert saved_matchup(page)['scenario']['bBleeding'] is True
        assert current_ratio()>base_ratio, 'B bleeding should activate A Hemomania'
        assert current_marker()!=base_marker, 'B bleeding must move the score marker'
        assert 'Hemomania' in page.locator('#matchupResult .matchup-condition-feedback').inner_text()
        assert 'Hemomania' in page.locator('#matchupResult .matchup-effect-grid').inner_text()
        page.locator('#matchupConditions [data-condition="bBleeding"]').uncheck()
        assert current_ratio()==base_ratio
        assert current_marker()==base_marker
        # A bleeding activates B's Hemomania when explicitly assigned.
        page.locator('#matchupSideB [data-field="source"]').select_option('manual')
        page.locator('#matchupSideB select[data-slot="1"]').select_option('Hemomania')
        no_bleed=current_ratio()
        page.locator('#matchupConditions [data-condition="aBleeding"]').check()
        assert current_ratio()<no_bleed, 'A bleeding should activate B Hemomania'
        assert saved_matchup(page)['scenario']['aBleeding'] is True
        page.locator('#matchupConditions [data-condition="aBleeding"]').uncheck()
        assert current_ratio()==no_bleed
        # Low health activates Accelerated Prey Drive on the opposing side.
        page.locator('#matchupSideA [data-field="source"]').select_option('manual')
        page.locator('#matchupSideA select[data-slot="1"]').select_option('Accelerated Prey Drive')
        healthy=current_ratio()
        page.locator('#matchupConditions [data-condition="bLowHealth"]').check()
        assert current_ratio()>healthy
        assert 'Accelerated Prey Drive' in page.locator('#matchupResult .matchup-condition-feedback').inner_text()
        page.locator('#matchupConditions [data-condition="bLowHealth"]').uncheck()
        assert current_ratio()==healthy
        # With both builds unmutated, changing any fight condition is tracked but is not a generic penalty.
        page.locator('#matchupSideA [data-field="source"]').select_option('none')
        page.locator('#matchupSideB [data-field="source"]').select_option('none')
        neutral=current_ratio()
        for flag in ['aBleeding','bBleeding','aLowHealth','bLowHealth']:
            page.locator(f'#matchupConditions [data-condition="{flag}"]').check()
            assert current_ratio()==neutral, f'{flag} incorrectly changed baseline combat power'
            assert 'no modeled score change' in page.locator('#matchupResult .matchup-condition-feedback').inner_text()
            page.locator(f'#matchupConditions [data-condition="{flag}"]').uncheck()
        page.locator('#matchupReset').click()
        print('Fight-condition change and no-effect feedback verified', flush=True)


        # Initial shared link, fractional generation -> Life 1; stale storage cannot win.
        original_a = build_lineage('Allosaurus', 1.5, 'Hemomania')
        plan_a = copy.deepcopy(original_a)
        plan_a['generation'] = 1
        page.goto(BASE + lineage_hash(original_a), wait_until='domcontentloaded')
        assert_planner_unchanged(page, plan_a)
        page.locator('[data-tab="growth"]').click()
        page.locator('#matchupSideA [data-field="source"]').select_option('lineage')
        page.locator('#matchupSideA [data-import-planner]').click()
        assert_import(page, 'A', plan_a, ['Hemomania'])
        assert_planner_unchanged(page, plan_a)
        saved_a = copy.deepcopy(saved_matchup(page)['a'])

        # Later hashchange, distinct B lineage, fractional Life 3.
        original_b = build_lineage('Omniraptor', 3.5, 'Epidermal Fibrosis', 'Cellular Regeneration')
        plan_b = copy.deepcopy(original_b)
        plan_b['generation'] = 3
        page.evaluate('(value) => { location.hash = value; }', lineage_hash(original_b))
        page.wait_for_function("""() =>
          window.originEntombPlanner.getSnapshot().dino === 'Omniraptor' &&
          window.originEntombPlanner.getSnapshot().generation === 3""")
        assert_planner_unchanged(page, plan_b)
        page.locator('[data-tab="growth"]').click()
        page.locator('#matchupSideB [data-field="source"]').select_option('lineage')
        page.locator('#matchupSideB [data-import-planner]').click()
        assert_import(page, 'B', plan_b, ['Epidermal Fibrosis', 'Cellular Regeneration'])
        assert_import(page, 'A', plan_a, ['Hemomania'])
        assert saved_matchup(page)['a'] == saved_a, 'Import into B overwrote A configuration'
        assert_planner_unchanged(page, plan_b)

        # Negative controls: each guard must fail on a specifically corrupted state.
        dino_select = page.locator('#matchupSideB select[data-field="dino"]')
        dino_select.evaluate("(el) => { el.value = 'Allosaurus'; }")
        must_reject(lambda: assert_import(page, 'B', plan_b, ['Epidermal Fibrosis', 'Cellular Regeneration']),
                    'wrong selected dinosaur')
        dino_select.evaluate("(el) => { el.value = 'Omniraptor'; }")

        gen_select = page.locator('#matchupSideB select[data-field="generation"]')
        gen_select.evaluate("(el) => { el.value = '2'; }")
        must_reject(lambda: assert_import(page, 'B', plan_b, ['Epidermal Fibrosis', 'Cellular Regeneration']),
                    'wrong selected generation')
        gen_select.evaluate("(el) => { el.value = '3'; }")

        chip = page.locator('#matchupSideB .matchup-mutations .chips .pill').first
        original_chip = chip.inner_text()
        chip.evaluate("(el) => { el.textContent = 'Unrelated mutation · Life 3'; }")
        must_reject(lambda: assert_import(page, 'B', plan_b, ['Epidermal Fibrosis', 'Cellular Regeneration']),
                    'incorrect imported active mutation')
        chip.evaluate('(el, text) => { el.textContent = text; }', original_chip)

        broken = saved_matchup(page)
        broken['a']['lineage']['dino'] = 'Ceratosaurus'
        page.evaluate('(value) => localStorage.setItem("origin-matchup-calculator-v2", JSON.stringify(value))', broken)
        must_reject(lambda: assert_other_side_unchanged(page, saved_a), 'other side overwritten')
        page.evaluate('(value) => localStorage.setItem("origin-matchup-calculator-v2", JSON.stringify(value))',
                      {**broken, 'a': saved_a})

        page.evaluate("""() => document.querySelector('#entombGenerations [data-generation="2"]').click()""")
        must_reject(lambda: assert_planner_unchanged(page, plan_b), 'planner mutated by import')
        page.evaluate("""() => document.querySelector('#entombGenerations [data-generation="3"]').click()""")
        assert_planner_unchanged(page, plan_b)
        assert_import(page, 'A', plan_a, ['Hemomania'])
        assert_import(page, 'B', plan_b, ['Epidermal Fibrosis', 'Cellular Regeneration'])
        print('Independent imports and negative controls verified', flush=True)

        # Narrow viewport, actual controls plus changelog geometry—not just text presence.
        mobile = browser.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
        mobile.set_default_timeout(12000)
        mobile.goto(BASE, wait_until='domcontentloaded')
        mobile.locator('[data-tab="growth"]').click()
        mobile.locator('#matchupSideA [data-customize-standard]').click()
        clear = mobile.locator('#matchupSideA [data-clear-retained]')
        assert clear.is_visible() and clear.is_enabled()
        assert_no_horizontal_overflow(mobile, 'Calculator (390px)')
        ARTIFACTS.mkdir(exist_ok=True)
        mobile.screenshot(path=str(ARTIFACTS / 'calculator-390.png'), full_page=True)
        clear.click()
        assert mobile.locator('#matchupSideA select[data-slot="4"]').input_value() == ''
        assert_no_horizontal_overflow(mobile, 'Calculator after clear (390px)')

        footer_link = mobile.locator('#siteVersion')
        assert footer_link.is_visible() and footer_link.is_enabled()
        footer_link.scroll_into_view_if_needed()
        assert footer_link.bounding_box() is not None
        footer_link.click()
        assert mobile.url.split('?')[0].endswith('/changelog.html')
        assert mobile.locator('h1').inner_text().strip() == 'Changelog'
        assert_no_horizontal_overflow(mobile, 'Changelog (390px)')
        assert_readable_content(mobile, 'main h1, main h2, main p, main li, main a')
        back = mobile.locator('main a[href="./index.html"]')
        assert back.is_visible() and back.is_enabled()
        mobile.screenshot(path=str(ARTIFACTS / 'changelog-390.png'), full_page=True)
        back.click()
        assert mobile.url.split('?')[0].endswith('/index.html')
        assert_no_horizontal_overflow(mobile, 'Calculator return (390px)')

        # Historical legacy save identifiers remain visible, excluded and clearable.
        historic = {'v': 1, 'd': 'Allosaurus', 'prime': False, 'sex': 'Male', 'growth': 75,
                    'contexts': [], 'slots': ['Hemomania', 'Traumatic Thrombosis', 'Epidermal Fibrosis', '']}
        mobile.goto(BASE + '#build=' + quote(json.dumps(historic), safe=''), wait_until='domcontentloaded')
        assert mobile.locator('#slot2').input_value() == 'Traumatic Thrombosis'
        assert 'EXCLUDED' in mobile.locator('#slot2 option:checked').inner_text()
        assert 'Traumatic Thrombosis' in mobile.locator('#customResult').inner_text()
        mobile.locator('#slot2').select_option('')
        assert mobile.locator('#slot2').input_value() == ''
        mobile.locator('[data-tab="mutations"]').click()
        mobile.locator('#mutationSearch').fill('Traumatic Thrombosis')
        assert 'REMOVED 0.21.720' in mobile.locator('#mutationList').inner_text()
        mobile.locator('#mutationList a[href*="sources.html#mutation-traumatic-thrombosis"]').click()
        assert mobile.url.endswith('/sources.html#mutation-traumatic-thrombosis')
        assert mobile.locator('#mutation-traumatic-thrombosis').is_visible()
        assert 'official' in mobile.locator('#mutation-traumatic-thrombosis .evidence-status').inner_text()
        assert mobile.locator('#mutationEvidence .evidence-entry').count() == 42
        mobile.locator('#evidenceSearch').fill('Tactile Endurance')
        assert mobile.locator('#mutationEvidence .evidence-entry').count() == 1
        assert '2, 4' in mobile.locator('#mutation-tactile-endurance').inner_text()
        mobile.locator('#evidenceSearch').fill('')
        mobile.locator('#evidenceStatus').select_option('disputed')
        assert mobile.locator('#mutationEvidence .evidence-entry').count() >= 1
        mobile.locator('#evidenceStatus').select_option('all')
        assert mobile.locator('#calculation-adult-power').is_visible()
        assert mobile.locator('#calculation-legacy').is_visible()
        assert mobile.locator('#speciesEvidence tbody tr').count() == 22
        assert_no_horizontal_overflow(mobile, 'Sources evidence at 390px')
        assert_readable_content(mobile, '.evidence-main h2, .evidence-main h3, .evidence-main p, .evidence-main a')
        mobile.screenshot(path=str(ARTIFACTS / 'sources-390.png'), full_page=True)
        page.goto(BASE + 'sources.html', wait_until='domcontentloaded')
        assert page.locator('#mutationEvidence .evidence-entry').count() == 42
        assert_no_horizontal_overflow(page, 'Sources at 1280px')
        page.screenshot(path=str(ARTIFACTS / 'sources-desktop.png'), full_page=True)
        page.goto(BASE, wait_until='domcontentloaded')
        assert page.locator('a.snapshot-chip[href="./sources.html"]').is_visible()
        page.locator('a.snapshot-chip').focus()
        page.keyboard.press('Enter')
        assert page.url.endswith('/sources.html'), 'Snapshot must be keyboard navigable'
        print('Source navigation, desktop/mobile evidence and historical-save checks verified', flush=True)

        assert not errors, errors
        print('Chromium browser smoke and 390px checks: PASS', flush=True)
        mobile.close()
        browser.close()
finally:
    server.terminate()
    server.wait(timeout=5)
