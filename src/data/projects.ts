import type { Project, PortfolioCard } from './types'

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

export const portfolio: PortfolioCard[] = [
  {
    id: 'rak-wwtp-1',
    name: rakProject.name,
    department: rakProject.department,
    status: 'active',
    budget: rakProject.totalBudget,
    contractType: 'PPP Contract',
    startLabel: 'Start 01.01.2026 (36 months)',
    durationMonths: 36,
    tags: rakProject.tags,
    progress: rakProject.overallProgress,
    teamInitials: rakProject.team.map((t) => ({ initials: t.initials, color: t.color })),
  },
  {
    id: 'al-hamra-roads',
    name: 'Al Hamra Masterplan — Road Network',
    department: 'RAK Municipality Urban Planning Dept',
    status: 'planning',
    contractType: 'Design-Build',
    tags: ['Infrastructure', 'Roads'],
    progress: 0,
    teamInitials: [
      { initials: 'OK', color: '#3b82f6' },
      { initials: 'MA', color: '#4caf82' },
    ],
  },
  {
    id: 'barjeel-retrofit',
    name: 'Barjeel Retrofit — Batch 1',
    department: 'RAK Municipality Energy Management',
    status: 'completed',
    budget: 42_000_000,
    contractType: 'Framework',
    startLabel: 'Completed Q4 2025',
    tags: ['Sustainability', 'Energy'],
    progress: 100,
    teamInitials: [
      { initials: 'HS', color: '#1a2235' },
      { initials: 'LR', color: '#f0a830' },
    ],
  },
]
