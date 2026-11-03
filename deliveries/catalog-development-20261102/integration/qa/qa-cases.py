"""Expand acceptance parameters without contacting or changing the application."""
from itertools import product
from pathlib import Path
import json
import sys


def reference_expectations(case):
    if case['audience'] != 'guest':
        return {'catalog': 'По обычным правам', 'profile': 'По обычным правам', 'profile_fields': 'По правам поля и тарифа'}
    catalog = 'Вход' if case['hide_directory_from_guests'] else 'Доступен по правам'
    if case['guest_experts_online_only'] and catalog != 'Вход':
        catalog = 'Только допущенные эксперты online'
    return {
        'catalog': catalog,
        'profile': 'Вход' if case['hide_profiles_from_guests'] else 'Доступен по правам',
        'profile_fields': ('Профиль закрыт' if case['hide_profiles_from_guests'] else
                           'Скрыты' if case['hide_extended_profile_fields'] else 'По правам поля'),
    }


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if sys.argv[1:] not in ([], ['--roles']):
        raise ValueError('Usage: python qa-cases.py [--roles]')
    plan = json.loads(Path(__file__).with_name('qa-coverage.json').read_text(encoding='utf-8'))
    dimensions = plan['dimensions']
    keys = [dimension['id'] for dimension in dimensions]
    if plan['schema'] != 'catalog_acceptance_parameters.v1' or len(keys) != len(set(keys)):
        raise ValueError('Invalid acceptance parameters')
    if sys.argv[1:] == ['--roles']:
        role_plan = json.loads(Path(__file__).with_name('qa-role-scenarios.json').read_text(encoding='utf-8'))
        role_scenarios = role_plan['scenarios']
        cards = next(dimension['values'] for dimension in dimensions if dimension['id'] == 'cards_template')
        filters = next(dimension['values'] for dimension in dimensions if dimension['id'] == 'filter_template')
        role_cases = list(product(role_scenarios, cards, filters))
        if role_plan['schema'] != 'catalog_role_scenarios.v1' or len(role_scenarios) != 8 or len(role_cases) != 32:
            raise ValueError('Invalid role scenarios')
        for index, (scenario, card, filter_name) in enumerate(role_cases, 1):
            print(json.dumps({'case_id': f'R-{index:03d}', **scenario, 'cards_template': card, 'filter_template': filter_name}, ensure_ascii=False))
        return
    cases = [dict(zip(keys, values)) for values in product(*(dimension['values'] for dimension in dimensions))]
    if len(cases) != plan['expected_case_count']:
        raise ValueError('Unexpected acceptance parameter count')
    for index, case in enumerate(cases, 1):
        print(json.dumps({'case_id': f'A-{index:03d}', **case, 'expected_reference': reference_expectations(case)}, ensure_ascii=False))


if __name__ == '__main__':
    try:
        main()
    except (KeyError, OSError, ValueError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
