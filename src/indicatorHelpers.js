import { flatten } from "lodash";

const rawIndicators = [
  {
    id: 7,
    userId: 2,
    title: "Механические параметры",
    sortOrder: 0,
    indicators: [
      {
        id: 20,
        groupId: 7,
        indicatorId: 6,
        color: 7,
        minValue: 0.0,
        maxValue: 100.0,
        lineStyle: 1,
        fillStyle: 1,
        sortOrder: null,
      },
      {
        id: 29,
        groupId: 7,
        indicatorId: 7,
        color: 0,
        minValue: 0.0,
        maxValue: 20.0,
        lineStyle: 1,
        fillStyle: 1,
        sortOrder: null,
      },
      {
        id: 32,
        groupId: 7,
        indicatorId: 9,
        color: 13,
        minValue: 0.0,
        maxValue: 75000000.0,
        lineStyle: 1,
        fillStyle: 1,
        sortOrder: null,
      },
    ],
  },
  {
    id: 6,
    userId: 2,
    title: "Тестовый 2",
    sortOrder: 1,
    indicators: [
      {
        id: 18,
        groupId: 6,
        indicatorId: 19,
        color: 3,
        minValue: 0.0,
        maxValue: 100.0,
        lineStyle: 1,
        fillStyle: 1,
        sortOrder: null,
      },
      {
        id: 19,
        groupId: 6,
        indicatorId: 1,
        color: 0,
        minValue: 0.0,
        maxValue: 2000.0,
        lineStyle: 1,
        fillStyle: 1,
        sortOrder: null,
      },
      {
        id: 31,
        groupId: 6,
        indicatorId: 2,
        color: 7,
        minValue: 0.0,
        maxValue: 50.0,
        lineStyle: 1,
        fillStyle: 2,
        sortOrder: null,
      },
      {
        id: 17,
        groupId: 6,
        indicatorId: 6,
        color: 4,
        minValue: 0.0,
        maxValue: 100.0,
        lineStyle: 1,
        fillStyle: 1,
        sortOrder: null,
      },
    ],
  },
  {
    id: 8,
    userId: 2,
    title: "Расход ПЖ",
    sortOrder: 2,
    indicators: [
      {
        id: 22,
        groupId: 8,
        indicatorId: 13,
        color: 7,
        minValue: 0.0,
        maxValue: 160.0,
        lineStyle: 1,
        fillStyle: 1,
        sortOrder: null,
      },
      {
        id: 21,
        groupId: 8,
        indicatorId: 12,
        color: 5,
        minValue: 0.0,
        maxValue: 3.0,
        lineStyle: 1,
        fillStyle: 1,
        sortOrder: null,
      },
    ],
  },
  {
    id: 9,
    userId: 2,
    title: "Параметры бурения",
    sortOrder: 3,
    indicators: [
      {
        id: 26,
        groupId: 9,
        indicatorId: 4,
        color: 13,
        minValue: 0.0,
        maxValue: 100000.0,
        lineStyle: 2,
        fillStyle: 1,
        sortOrder: null,
      },
      {
        id: 27,
        groupId: 9,
        indicatorId: 5,
        color: 16,
        minValue: 0.0,
        maxValue: 1500.0,
        lineStyle: 2,
        fillStyle: 1,
        sortOrder: null,
      },
      {
        id: 28,
        groupId: 9,
        indicatorId: 2,
        color: 15,
        minValue: 0.0,
        maxValue: 35.0,
        lineStyle: 1,
        fillStyle: 1,
        sortOrder: null,
      },
    ],
  },
  {
    id: 10,
    userId: 2,
    title: "Насос",
    sortOrder: 4,
    indicators: [
      {
        id: 23,
        groupId: 10,
        indicatorId: 14,
        color: 14,
        minValue: 0.0,
        maxValue: 80.0,
        lineStyle: 1,
        fillStyle: 1,
        sortOrder: null,
      },
      {
        id: 24,
        groupId: 10,
        indicatorId: 17,
        color: 6,
        minValue: 0.0,
        maxValue: 60.0,
        lineStyle: 1,
        fillStyle: 1,
        sortOrder: null,
      },
      {
        id: 25,
        groupId: 10,
        indicatorId: 21,
        color: 16,
        minValue: 0.0,
        maxValue: 100.0,
        lineStyle: 1,
        fillStyle: 1,
        sortOrder: null,
      },
      {
        id: 30,
        groupId: 10,
        indicatorId: 19,
        color: 9,
        minValue: 0.0,
        maxValue: 0.05,
        lineStyle: 1,
        fillStyle: 1,
        sortOrder: null,
      },
    ],
  },
];

const flattened = flatten(
  rawIndicators.map((raw) => [].concat(...raw.indicators))
);

export const indicators = flattened.map((indicator) => {
  return {
    id: indicator.indicatorId,
    domain: [indicator.minValue, indicator.maxValue],
    title: "Тултип",
  };
});