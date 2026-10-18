import { describe, expect, it } from 'vitest';

import { parseContributions } from './contributions';

// The shape of github.com/users/<user>/contributions, trimmed to three days.
const html = `
<table>
  <tr>
    <td tabindex="0" data-ix="0" style="width: 11px" data-date="2026-10-04" id="contribution-day-component-0-0" data-level="0" role="gridcell" class="ContributionCalendar-day"></td>
    <td tabindex="0" data-ix="1" style="width: 11px" data-date="2026-10-11" id="contribution-day-component-0-1" data-level="4" role="gridcell" class="ContributionCalendar-day"></td>
  </tr>
  <tr>
    <td tabindex="0" data-ix="0" style="width: 11px" data-date="2026-10-05" id="contribution-day-component-1-0" data-level="1" role="gridcell" class="ContributionCalendar-day"></td>
  </tr>
</table>
<tool-tip id="t1" for="contribution-day-component-0-0" popover="manual" class="sr-only">No contributions on October 4th.</tool-tip>
<tool-tip id="t2" for="contribution-day-component-0-1" popover="manual" class="sr-only">1,204 contributions on October 11th.</tool-tip>
<tool-tip id="t3" for="contribution-day-component-1-0" popover="manual" class="sr-only">1 contribution on October 5th.</tool-tip>
`;

describe('parseContributions', () => {
  it('reads every day in date order, with its shade and count', () => {
    const { days } = parseContributions(html);
    expect(days).toEqual([
      { date: '2026-10-04', level: 0, count: 0 },
      { date: '2026-10-05', level: 1, count: 1 },
      { date: '2026-10-11', level: 4, count: 1204 },
    ]);
  });

  it('adds up the total', () => {
    expect(parseContributions(html).total).toBe(1205);
  });

  it('returns no days when the markup is not a calendar', () => {
    expect(parseContributions('<p>Not found</p>')).toEqual({ days: [], total: 0 });
  });
});
