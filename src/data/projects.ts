import type { Project, PortfolioCard, Phase } from './types'

/** Build sensible, domain-neutral stages spanning a project's duration.
 *  Used for projects created at runtime so they don't inherit the hero
 *  project's wastewater-specific phases. */
export function genericPhases(durationMonths: number): Phase[] {
  const d = Math.max(3, durationMonths)
  const p1End = Math.max(0, Math.round(d * 0.2) - 1)
  const p2End = Math.max(p1End + 1, Math.round(d * 0.85) - 1)
  return [
    { id: 'planning', name: 'Planning & design', startMonth: 0, endMonth: p1End, progressPct: 0, status: 'not_started' },
    { id: 'execution', name: 'Execution', startMonth: p1End + 1, endMonth: p2End, progressPct: 0, status: 'not_started' },
    { id: 'closeout', name: 'Handover & closeout', startMonth: p2End + 1, endMonth: d - 1, progressPct: 0, status: 'not_started' },
  ]
}

const team: Project['team'] = [
  {
    id: 'ahmed',
    name: 'Ahmed Al Mansouri',
    role: 'Project Manager',
    access: 'Full access',
    initials: 'AM',
    color: '#1a2235',
    fteByPhase: [1, 1, 1],
    capacity: 1,
  },
  {
    id: 'fatima',
    name: 'Fatima Al Rashidi',
    role: 'Finance Officer',
    access: 'Budget view',
    initials: 'FR',
    color: '#4caf82',
    fteByPhase: [0.5, 0.5, 1],
    capacity: 1,
  },
  {
    id: 'james',
    name: 'James Whitfield',
    role: 'Senior Engineer',
    access: 'Execution view',
    initials: 'JW',
    color: '#3b82f6',
    fteByPhase: [0.5, 1, 0.5],
    capacity: 1,
  },
  {
    id: 'sara',
    name: 'Sara Kovacs',
    role: 'Document Controller',
    access: 'Read only',
    initials: 'SK',
    color: '#f0a830',
    fteByPhase: [0.5, 0.5, 0.5],
    capacity: 1,
  },
]

export const rakProject: Project = {
  id: 'rak-wwtp-1',
  name: 'RAK Wastewater Treatment Plant — Phase 1',
  department: 'RAK Public Services Department',
  contractType: 'PPP — Public-Private Partnership',
  startMonthLabel: 'Jan 2026',
  startYear: 2026,
  startMonthIndex: 0,
  durationMonths: 36,
  totalBudget: 387_000_000,
  spentBudget: 4_200_000,
  pmId: 'ahmed',
  tags: ['Infrastructure', 'Water', 'Sustainability'],
  status: 'active',
  overallProgress: 8,
  currentPhaseId: 'design',
  health: 'amber',
  healthNote: 'On track — attention needed',

  team,

  internalStakeholders: [
    {
      name: 'H.E. Munther bin Shekar',
      title: 'Director General, RAK Municipality',
      notification: 'Executive summary — weekly',
    },
    {
      name: 'Eng. Khalid Al Zaabi',
      title: 'Head, Public Services Dept',
      notification: 'Phase updates',
    },
  ],

  externalPartners: [
    {
      org: 'EtihadWE',
      contact: 'Rashid Al Nuaimi',
      role: 'Water & electricity connection',
      status: 'amber',
    },
    {
      org: 'TAQA Water Solutions',
      contact: 'Layla Haddad',
      role: 'Treatment plant delivery',
      status: 'green',
    },
    {
      org: 'Saur International',
      contact: 'Pierre Lambert',
      role: 'Operations & maintenance',
      status: 'green',
    },
  ],

  budgetLines: [
    { phase: 'Design & Permitting', allocated: 18_000_000, category: 'Consulting, legal' },
    { phase: 'Construction', allocated: 320_000_000, category: 'Civil works, equipment' },
    { phase: 'Commissioning', allocated: 35_000_000, category: 'Testing, training' },
    { phase: 'Contingency', allocated: 14_000_000, category: 'Risk buffer' },
  ],

  equipment: [
    { name: 'Treatment unit #1', category: 'Treatment', phase: 'Construction', status: 'Ordered' },
    { name: 'Treatment unit #2', category: 'Treatment', phase: 'Construction', status: 'Ordered' },
    { name: 'Treatment unit #3', category: 'Treatment', phase: 'Construction', status: 'Planned' },
    { name: 'Piping system', category: 'Civil', phase: 'Construction', status: 'Planned' },
    { name: 'Site vehicles (×4)', category: 'Logistics', phase: 'Design & Permitting', status: 'Delivered' },
    { name: 'Lab equipment', category: 'Commissioning', phase: 'Commissioning', status: 'Planned' },
  ],

  dependencies: [
    {
      dependency: 'Federal environmental approval',
      type: 'External permit',
      owner: 'Ministry of Climate Change',
      requiredBy: 'Before construction start',
      status: 'amber',
    },
    {
      dependency: 'Land handover confirmation',
      type: 'Internal permit',
      owner: 'RAK Municipality Legal',
      requiredBy: 'Before design start',
      status: 'green',
    },
    {
      dependency: 'EtihadWE connection agreement',
      type: 'Contract',
      owner: 'EtihadWE',
      requiredBy: 'Before commissioning',
      status: 'amber',
    },
  ],

  risks: [
    {
      risk: 'Permit delay (federal)',
      probability: 'Medium',
      impact: 'High',
      mitigation: 'Early submission, legal buffer',
      owner: 'Legal team',
    },
    {
      risk: 'PPP partner delivery delay',
      probability: 'Low',
      impact: 'High',
      mitigation: 'Contractual milestones',
      owner: 'Ahmed Al Mansouri',
    },
    {
      risk: 'Cost overrun (civil works)',
      probability: 'Medium',
      impact: 'Medium',
      mitigation: '14M AED contingency',
      owner: 'Fatima Al Rashidi',
    },
  ],

  phases: [
    {
      id: 'design',
      name: 'Design & permitting',
      startMonth: 0,
      endMonth: 4,
      progressPct: 35,
      status: 'in_progress',
    },
    {
      id: 'construction',
      name: 'Construction',
      startMonth: 5,
      endMonth: 32,
      progressPct: 0,
      status: 'not_started',
    },
    {
      id: 'commissioning',
      name: 'Commissioning',
      startMonth: 33,
      endMonth: 35,
      progressPct: 0,
      status: 'not_started',
    },
  ],

  milestones: [
    { id: 'm1', name: 'Federal env. approval', month: 2, rag: 'amber', state: 'pending' },
    { id: 'm2', name: 'Construction start', month: 5, rag: 'green', state: 'on_track' },
    { id: 'm3', name: '50% capacity test', month: 23, rag: 'amber', state: 'scheduled' },
    { id: 'm4', name: 'Full commissioning', month: 35, rag: 'green', state: 'scheduled' },
  ],

  issues: [
    {
      id: 'i1',
      title: 'Env. permit application pending Ministry response',
      category: 'Permitting',
      severity: 'medium',
      raised: '12 May 2026',
      owner: 'Legal team',
      daysOpen: 41,
    },
    {
      id: 'i2',
      title: 'Land survey addendum requested by planning dept',
      category: 'Permitting',
      severity: 'medium',
      raised: '28 May 2026',
      owner: 'Sara Kovacs',
      daysOpen: 25,
    },
    {
      id: 'i3',
      title: 'Geotechnical report clarification for foundation design',
      category: 'Technical',
      severity: 'low',
      raised: '04 Jun 2026',
      owner: 'James Whitfield',
      daysOpen: 18,
    },
  ],

  tasks: { todo: 12, inProgress: 5, done: 8 },

  inProgressTasks: [
    { title: 'Finalise hydraulic design package', assigneeId: 'james', due: '30 Jun 2026' },
    { title: 'Compile federal permit submission', assigneeId: 'sara', due: '02 Jul 2026' },
    { title: 'Phase 1 budget reconciliation', assigneeId: 'fatima', due: '05 Jul 2026' },
  ],

  // Cumulative planned vs actual spend (AED millions). "Now" = Feb 2026, so
  // actuals exist for Jan–Feb only; Feb actual 4.2M vs planned 4.8M = under by 0.6M.
  burn: [
    { month: 'Jan', planned: 2.0, actual: 1.9 },
    { month: 'Feb', planned: 4.8, actual: 4.2 },
    { month: 'Mar', planned: 7.5, actual: null },
    { month: 'Apr', planned: 10.0, actual: null },
    { month: 'May', planned: 12.5, actual: null },
    { month: 'Jun', planned: 15.0, actual: null },
  ],

  kpis: [
    { label: 'Treatment capacity', current: 0, target: 60_000, unit: 'm³/day', note: 'Target at commissioning' },
    { label: 'Population served', current: 0, target: 300_000, unit: 'residents' },
    { label: 'PPP partners active', current: 3, target: 3, unit: 'partners' },
    { label: 'Sustainability rating', current: 0, target: 1, unit: '', note: 'Pending Barjeel review' },
  ],
}

/* ---------------------------------------------------------------------------
 * Al Hamra Masterplan — Road Network (Planning state)
 * ------------------------------------------------------------------------- */
const alHamraTeam: Project['team'] = [
  { id: 'omar', name: 'Omar Al Khalifa', role: 'Project Manager', access: 'Full access', initials: 'OK', color: '#3b82f6', fteByPhase: [1, 1, 1], capacity: 1 },
  { id: 'mariam', name: 'Mariam Al Suwaidi', role: 'Senior Engineer', access: 'Execution view', initials: 'MA', color: '#4caf82', fteByPhase: [0.5, 1, 0.5], capacity: 1 },
  { id: 'noura', name: 'Noura Hassan', role: 'Finance Officer', access: 'Budget view', initials: 'NH', color: '#f0a830', fteByPhase: [0.5, 0.5, 0.5], capacity: 1 },
]

export const alHamraProject: Project = {
  id: 'al-hamra-roads',
  name: 'Al Hamra Masterplan — Road Network',
  department: 'RAK Urban Planning Dept',
  contractType: 'Design-Build',
  startMonthLabel: 'Q3 2026 (planned)',
  startYear: 2026,
  startMonthIndex: 6,
  durationMonths: 30,
  totalBudget: 124_600_000,
  spentBudget: 0,
  pmId: 'omar',
  tags: ['Urban Development', 'Transport', 'Masterplan'],
  status: 'planning',
  overallProgress: 0,
  currentPhaseId: 'planning',
  health: 'green',
  healthNote: 'Planning — awaiting start approval',
  team: alHamraTeam,
  internalStakeholders: [
    { name: 'Eng. Khalid Al Zaabi', title: 'Head, Urban Planning Dept', notification: 'Phase updates' },
  ],
  externalPartners: [
    { org: 'Parsons', contact: 'David Reed', role: 'Masterplan design consultant', status: 'green' },
  ],
  budgetLines: [
    { phase: 'Design & masterplanning', allocated: 16_600_000, category: 'Consulting' },
    { phase: 'Construction', allocated: 98_000_000, category: 'Civil works' },
    { phase: 'Handover', allocated: 10_000_000, category: 'Testing, handover' },
  ],
  equipment: [
    { name: 'Survey equipment', category: 'Logistics', phase: 'Planning & design', status: 'Planned' },
  ],
  dependencies: [
    { dependency: 'Masterplan approval', type: 'Internal permit', owner: 'RAK Urban Planning', requiredBy: 'Before design start', status: 'amber' },
  ],
  risks: [
    { risk: 'Right-of-way acquisition delay', probability: 'Medium', impact: 'High', mitigation: 'Early land negotiations', owner: 'Omar Al Khalifa' },
  ],
  phases: genericPhases(30).map((p, i) => ({ ...p, name: ['Design & masterplanning', 'Construction', 'Handover'][i] })),
  milestones: [
    { id: 'h1', name: 'Masterplan approval', month: 6, rag: 'amber', state: 'pending' },
    { id: 'h2', name: 'Construction start', month: 12, rag: 'green', state: 'scheduled' },
    { id: 'h3', name: 'Network handover', month: 29, rag: 'green', state: 'scheduled' },
  ],
  issues: [],
  tasks: { todo: 6, inProgress: 0, done: 0 },
  inProgressTasks: [],
  burn: [
    { month: 'Jul', planned: 0, actual: null },
    { month: 'Aug', planned: 1.2, actual: null },
    { month: 'Sep', planned: 2.6, actual: null },
  ],
  kpis: [
    { label: 'Road network length', current: 0, target: 42, unit: 'km' },
    { label: 'Population served', current: 0, target: 85_000, unit: 'residents' },
  ],
}

/* ---------------------------------------------------------------------------
 * Barjeel Retrofit — Batch 1 (Completed)
 * ------------------------------------------------------------------------- */
const barjeelTeam: Project['team'] = [
  { id: 'hamad', name: 'Hamad Al Shamsi', role: 'Project Manager', access: 'Full access', initials: 'HS', color: '#1a2235', fteByPhase: [1, 1, 1], capacity: 1 },
  { id: 'leila', name: 'Leila Rahman', role: 'Senior Engineer', access: 'Execution view', initials: 'LR', color: '#f0a830', fteByPhase: [1, 1, 0.5], capacity: 1 },
]

export const barjeelProject: Project = {
  id: 'barjeel-retrofit',
  name: 'Barjeel Retrofit — Batch 1',
  department: 'RAK Energy Efficiency Office',
  contractType: 'Framework',
  startMonthLabel: 'Jan 2024',
  startYear: 2024,
  startMonthIndex: 0,
  durationMonths: 12,
  totalBudget: 15_200_000,
  spentBudget: 15_200_000,
  pmId: 'hamad',
  tags: ['Energy', 'Sustainability', 'Retrofit'],
  status: 'completed',
  overallProgress: 100,
  currentPhaseId: 'closeout',
  health: 'green',
  healthNote: 'Completed — delivered Dec 2024',
  team: barjeelTeam,
  internalStakeholders: [
    { name: 'H.E. Munther bin Shekar', title: 'Director General, RAK Municipality', notification: 'Executive summary' },
  ],
  externalPartners: [
    { org: 'Etihad ESCO', contact: 'Sami Aziz', role: 'Retrofit delivery', status: 'green' },
  ],
  budgetLines: [
    { phase: 'Audit & design', allocated: 2_200_000, category: 'Consulting' },
    { phase: 'Retrofit works', allocated: 11_500_000, category: 'Installation' },
    { phase: 'Verification', allocated: 1_500_000, category: 'M&V' },
  ],
  equipment: [
    { name: 'HVAC controllers', category: 'Energy', phase: 'Retrofit works', status: 'In use' },
  ],
  dependencies: [],
  risks: [],
  phases: [
    { id: 'audit', name: 'Audit & design', startMonth: 0, endMonth: 2, progressPct: 100, status: 'complete' },
    { id: 'retrofit', name: 'Retrofit works', startMonth: 3, endMonth: 9, progressPct: 100, status: 'complete' },
    { id: 'closeout', name: 'Verification', startMonth: 10, endMonth: 11, progressPct: 100, status: 'complete' },
  ],
  milestones: [
    { id: 'b1', name: 'Energy audit complete', month: 2, rag: 'green', state: 'done' },
    { id: 'b2', name: 'Retrofit complete', month: 9, rag: 'green', state: 'done' },
    { id: 'b3', name: 'Savings verified', month: 11, rag: 'green', state: 'done' },
  ],
  issues: [],
  tasks: { todo: 0, inProgress: 0, done: 24 },
  inProgressTasks: [],
  burn: [
    { month: 'Q1', planned: 4, actual: 3.8 },
    { month: 'Q2', planned: 9, actual: 8.6 },
    { month: 'Q3', planned: 13, actual: 12.9 },
    { month: 'Q4', planned: 15.2, actual: 15.2 },
  ],
  kpis: [
    { label: 'Energy saved', current: 32, target: 30, unit: '% per year' },
    { label: 'Buildings retrofitted', current: 18, target: 18, unit: 'buildings' },
  ],
}

export const allProjects: Project[] = [rakProject, alHamraProject, barjeelProject]

function cardFor(p: Project, startLabel: string): PortfolioCard {
  return {
    id: p.id,
    name: p.name,
    department: p.department,
    status: p.status,
    budget: p.totalBudget,
    contractType: p.contractType.includes('PPP') ? 'PPP Contract' : p.contractType,
    startLabel,
    durationMonths: p.durationMonths,
    tags: p.tags,
    progress: p.overallProgress,
    teamInitials: p.team.map((t) => ({ initials: t.initials, color: t.color })),
  }
}

export const portfolio: PortfolioCard[] = [
  cardFor(rakProject, 'Start 01.01.2026 (36 months)'),
  cardFor(alHamraProject, 'Expected start Q3 2026'),
  cardFor(barjeelProject, 'Completed Dec 2024'),
]
