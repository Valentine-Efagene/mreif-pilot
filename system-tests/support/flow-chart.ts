import type { StepResult, SystemTestReport } from './report-writer';

function sanitizeMermaidLabel(text: string): string {
  return text
    .replace(/"/g, "'")
    .replace(/\n/g, ' ')
    .replace(/\[/g, '(')
    .replace(/\]/g, ')')
    .slice(0, 80);
}

function stepIcon(status: StepResult['status']): string {
  switch (status) {
    case 'passed':
      return '✓';
    case 'failed':
      return '✗';
    case 'skipped':
      return '○';
  }
}

function statusEmoji(status: StepResult['status']): string {
  switch (status) {
    case 'passed':
      return '✅';
    case 'failed':
      return '❌';
    case 'skipped':
      return '⏭️';
  }
}

/** Mermaid flowchart for milestone progression (visible in GitHub / many Markdown viewers). */
export function buildMilestoneFlowchart(report: SystemTestReport): string {
  const lines: string[] = [
    '```mermaid',
    'flowchart TD',
    '  classDef passed fill:#d4edda,stroke:#28a745,color:#155724',
    '  classDef failed fill:#f8d7da,stroke:#dc3545,color:#721c24',
    '  classDef skipped fill:#e2e3e5,stroke:#6c757d,color:#383d41',
    '  classDef pending fill:#fff3cd,stroke:#ffc107,color:#856404',
    '  start([Start])',
  ];

  if (report.steps.length === 0) {
    lines.push('  start --> none[No milestones recorded]');
    lines.push(
      `  endNode([End: ${report.status.toUpperCase()}])`,
      '  none --> endNode',
    );
    lines.push('```');
    return lines.join('\n');
  }

  let prev = 'start';
  let failedIndex = -1;

  report.steps.forEach((step, index) => {
    const id = `m${index}`;
    const label = sanitizeMermaidLabel(`${stepIcon(step.status)} ${step.name}`);
    lines.push(`  ${id}["${label}"]`);
    lines.push(`  ${prev} --> ${id}`);
    lines.push(`  class ${id} ${step.status}`);
    if (step.status === 'failed') {
      failedIndex = index;
    }
    prev = id;
  });

  const endId = 'endNode';
  if (failedIndex >= 0) {
    const haltId = 'halt';
    lines.push(
      `  ${haltId}{{"Stopped at milestone ${failedIndex + 1}"}}`,
      `  ${prev} --> ${haltId}`,
      `  class ${haltId} failed`,
      `  ${endId}([End: FAILED])`,
      `  ${haltId} --> ${endId}`,
      `  class ${endId} failed`,
    );
  } else {
    lines.push(
      `  ${endId}([End: ${report.status.toUpperCase()}])`,
      `  ${prev} --> ${endId}`,
      `  class ${endId} ${report.status === 'passed' ? 'passed' : 'failed'}`,
    );
  }

  lines.push('```');
  return lines.join('\n');
}

export function buildMilestoneTable(steps: StepResult[]): string[] {
  const header = [
    '| # | Milestone | Status | Detail |',
    '|---|-----------|--------|--------|',
  ];
  const rows = steps.map((step, index) => {
    const detail = (step.detail ?? '').replace(/\|/g, '\\|');
    return `| ${index + 1} | ${step.name} | ${statusEmoji(step.status)} ${step.status} | ${detail} |`;
  });
  return [...header, ...rows];
}

/** ASCII fallback for plain-text viewers. */
export function buildAsciiFlow(steps: StepResult[], overall: 'passed' | 'failed'): string[] {
  const lines = ['```', 'START'];
  for (const step of steps) {
    const branch = step.status === 'failed' ? ' └─✗ STOP' : ' │';
    lines.push(`${branch} ${stepIcon(step.status)} ${step.name}`);
    if (step.detail && step.status !== 'passed') {
      lines.push(` │    ${step.detail}`);
    }
    if (step.status === 'failed') {
      lines.push(' END (FAILED)');
      lines.push('```');
      return lines;
    }
  }
  lines.push(` └── END (${overall.toUpperCase()})`);
  lines.push('```');
  return lines;
}
