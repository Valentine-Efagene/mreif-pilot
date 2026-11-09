import * as fs from 'fs';
import * as path from 'path';
import {
  buildAsciiFlow,
  buildMilestoneFlowchart,
  buildMilestoneTable,
} from './flow-chart';

export type StepResult = {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  detail?: string;
};

export type SystemTestReport = {
  scenario: string;
  mode: string;
  startedAt: string;
  finishedAt: string;
  status: 'passed' | 'failed';
  steps: StepResult[];
  notes?: string[];
};

function firstFailedStep(steps: StepResult[]): StepResult | undefined {
  return steps.find((s) => s.status === 'failed');
}

export function writeScenarioReport(
  scenarioDir: string,
  report: SystemTestReport,
): void {
  const reportPath = path.join(scenarioDir, 'REPORT.md');
  const failed = firstFailedStep(report.steps);

  const lines = [
    '# Test report',
    '',
    `| Field | Value |`,
    `|-------|-------|`,
    `| Scenario | ${report.scenario} |`,
    `| Mode | ${report.mode} |`,
    `| **Overall** | **${report.status.toUpperCase()}** |`,
    `| Failed at | ${failed ? failed.name : '—'} |`,
    `| Milestones passed | ${report.steps.filter((s) => s.status === 'passed').length} / ${report.steps.length} |`,
    `| Started | ${report.startedAt} |`,
    `| Finished | ${report.finishedAt} |`,
    '',
    '## Milestone flow',
    '',
    'Where the run stopped (if it failed) is shown on the chart.',
    '',
    buildMilestoneFlowchart(report),
    '',
    '## Milestone checklist',
    '',
    ...(report.steps.length > 0
      ? buildMilestoneTable(report.steps)
      : ['_No milestones recorded._']),
    '',
    '## ASCII flow',
    '',
    ...buildAsciiFlow(report.steps, report.status),
    '',
    '## Step log',
    '',
    ...report.steps.map(
      (s) =>
        `- **${s.name}** — ${s.status}${s.detail ? `: ${s.detail}` : ''}`,
    ),
  ];

  if (report.notes?.length) {
    lines.push('', '## Notes', '', ...report.notes.map((n) => `- ${n}`));
  }

  lines.push(
    '',
    '_This file is overwritten on each test run. Every scenario report includes a milestone flow chart._',
    '',
  );

  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');
}
