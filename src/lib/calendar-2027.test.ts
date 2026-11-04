import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calendarSettingsSchema,
  createCalendarSvg,
  DEFAULT_CALENDAR_SETTINGS,
  getCalendarMonths,
  getMonthCells,
  getPaperDimensions,
} from './calendar-2027';

const labels = {
  months: Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`),
  weekdays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  notes: 'NOTES',
  yearLabel: 'YEAR AT A GLANCE',
};

test('both week starts include every 2027 date exactly once in its correct weekday', () => {
  for (const weekStart of ['monday', 'sunday'] as const) {
    let total = 0;
    for (let month = 0; month < 12; month++) {
      const cells = getMonthCells(month, weekStart);
      const days = cells.filter((day): day is number => day !== null);
      const expectedCount = new Date(Date.UTC(2027, month + 1, 0)).getUTCDate();
      assert.equal(cells.length, 42);
      assert.deepEqual(
        days,
        Array.from({ length: expectedCount }, (_, i) => i + 1)
      );
      cells.forEach((day, index) => {
        if (day !== null)
          assert.equal(
            (index + (weekStart === 'monday' ? 1 : 0)) % 7,
            new Date(Date.UTC(2027, month, day)).getUTCDay()
          );
      });
      total += days.length;
    }
    assert.equal(total, 365);
  }
  assert.equal(getMonthCells(0, 'sunday')[5], 1);
  assert.equal(getMonthCells(1, 'monday').filter(Boolean).length, 28);
});

test('paper dimensions and exported page selection follow the chosen layout', () => {
  assert.deepEqual(getPaperDimensions(DEFAULT_CALENDAR_SETTINGS), {
    width: 210,
    height: 297,
  });
  assert.deepEqual(
    getPaperDimensions({
      ...DEFAULT_CALENDAR_SETTINGS,
      paper: 'letter',
      orientation: 'landscape',
    }),
    { width: 279.4, height: 215.9 }
  );
  assert.deepEqual(getCalendarMonths(DEFAULT_CALENDAR_SETTINGS), [null]);
  assert.deepEqual(
    getCalendarMonths({
      ...DEFAULT_CALENDAR_SETTINGS,
      layout: 'month',
      month: 8,
    }),
    [8]
  );
  assert.deepEqual(
    getCalendarMonths({ ...DEFAULT_CALENDAR_SETTINGS, layout: 'all-months' }),
    Array.from({ length: 12 }, (_, i) => i)
  );
});

test('custom titles are escaped as text rather than executable SVG markup', () => {
  const svg = createCalendarSvg(
    { ...DEFAULT_CALENDAR_SETTINGS, title: '<script>alert("x")</script>&' },
    labels
  );
  assert.ok(!svg.includes('<script>'));
  assert.ok(svg.includes('&lt;script&gt;'));
  assert.ok(svg.includes('&quot;x&quot;'));
});

test('year and monthly previews contain the expected month labels and optional notes', () => {
  const year = createCalendarSvg(DEFAULT_CALENDAR_SETTINGS, labels);
  labels.months.forEach((month) =>
    assert.ok(year.includes(`>${month}</text>`))
  );
  const month = createCalendarSvg(
    { ...DEFAULT_CALENDAR_SETTINGS, layout: 'month', month: 1, notes: false },
    labels
  );
  assert.ok(month.includes('>Month 2</text>'));
  assert.ok(!month.includes('>Month 3</text>'));
  assert.ok(!month.includes('>29</text>'));
  assert.ok(!month.includes('>NOTES</text>'));
});

test('invalid month indices and oversized custom titles fail validation', () => {
  assert.equal(
    calendarSettingsSchema.safeParse({
      ...DEFAULT_CALENDAR_SETTINGS,
      month: 12,
    }).success,
    false
  );
  assert.equal(
    calendarSettingsSchema.safeParse({
      ...DEFAULT_CALENDAR_SETTINGS,
      title: 'a'.repeat(61),
    }).success,
    false
  );
});
