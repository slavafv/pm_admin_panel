import type { Project, Phase, RAG, TeamMember, Equipment } from './types'

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
    availability: 'On leave',
  },
]

export const rakProject: Project = {
  id: 'rak-wwtp-1',
  name: 'RAK Wastewater Treatment Plant — Phase 1',
  department: 'RAK Public Services Department',
  contractType: 'PPP — Public-Private Partnership',
  domain: 'Water',
  location: 'Al Hamra Industrial Zone, RAK',
  description: 'Design, construction and commissioning of a 60,000 m³/day wastewater treatment plant serving the southern districts of Ras Al Khaimah.',
  startMonthLabel: 'Jan 2026',
  startYear: 2026,
  startMonthIndex: 0,
  durationMonths: 36,
  totalBudget: 387_000_000,
  spentBudget: 4_200_000,
  pmId: 'ahmed',
  tags: ['Infrastructure', 'Water', 'Sustainability'],
  status: 'delivery',
  overallProgress: 8,
  currentPhaseId: 'design',
  health: 'amber',
  healthNote: 'Needs attention',

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
    // serviceUntilMonth = month (from project start) when lease/cert ends
    { name: 'CRN-01 Tower crane', category: 'Heavy plant', phase: 'Construction', status: 'In use', utilization: 88, operatorId: 'james', costPerHour: 120, maintenance: 'Due soon', serviceUntilMonth: 28 },
    { name: 'EXC-104 Excavator', category: 'Excavators', phase: 'Construction', status: 'In use', utilization: 91, operatorId: 'james', costPerHour: 64, maintenance: 'Up to date' },
    { name: 'TRT-01 Treatment unit #1', category: 'Treatment', phase: 'Construction', status: 'Available', utilization: 0, costPerHour: 0, maintenance: 'Up to date', serviceUntilMonth: 40 },
    { name: 'TRT-02 Treatment unit #2', category: 'Treatment', phase: 'Construction', status: 'Planned', utilization: 0, maintenance: 'Pending' },
    { name: 'VEH-09 Site vehicles (×4)', category: 'Logistics', phase: 'Construction', status: 'Maintenance', utilization: 54, costPerHour: 30, maintenance: 'Overdue', serviceUntilMonth: 18 },
    { name: 'LAB-15 Lab equipment', category: 'Commissioning', phase: 'Commissioning', status: 'Planned', utilization: 0, maintenance: 'Pending' },
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
    { id: 'R-01', risk: 'Federal environmental permit delay', probability: 3, impact: 4, mitigation: 'Early submission, legal buffer', status: 'Mitigating', owner: 'Legal team' },
    { id: 'R-02', risk: 'PPP partner delivery delay', probability: 2, impact: 4, mitigation: 'Contractual milestones', status: 'Monitoring', owner: 'Ahmed Al Mansouri' },
    { id: 'R-03', risk: 'Cost overrun (civil works)', probability: 3, impact: 3, mitigation: '14M AED contingency', status: 'Open', owner: 'Fatima Al Rashidi' },
  ],

  assumptions: [
    { text: 'Federal environmental approval granted by Q2 2026', owner: 'Legal team', status: 'Open' },
    { text: 'EtihadWE connection capacity available at commissioning', owner: 'Ahmed Al Mansouri', status: 'Open' },
    { text: 'Land handover completed before design start', owner: 'RAK Legal', status: 'Validated' },
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
  domain: 'Urban Development',
  location: 'Al Hamra, RAK',
  description: 'Masterplanned road network for the Al Hamra district — design and construction of arterial roads, junctions and utilities corridors.',
  startMonthLabel: 'Q3 2026 (planned)',
  startYear: 2026,
  startMonthIndex: 6,
  durationMonths: 30,
  totalBudget: 124_600_000,
  spentBudget: 0,
  pmId: 'omar',
  tags: ['Urban Development', 'Transport', 'Masterplan'],
  status: 'presale',
  overallProgress: 0,
  currentPhaseId: 'planning',
  health: 'green',
  healthNote: 'On track',
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
    { id: 'R-01', risk: 'Right-of-way acquisition delay', probability: 3, impact: 4, mitigation: 'Early land negotiations', status: 'Open', owner: 'Omar Al Khalifa' },
  ],
  assumptions: [
    { text: 'Masterplan approved by RAK Urban Planning in 2026', owner: 'Omar Al Khalifa', status: 'Open' },
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
  domain: 'Energy',
  location: 'Multiple government buildings, RAK',
  description: 'Energy-efficiency retrofit of the first batch of RAK government buildings — HVAC, lighting and controls upgrade with measured savings.',
  startMonthLabel: 'Jan 2025',
  startYear: 2025,
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
  healthNote: 'Completed',
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
  assumptions: [],
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

/* ---------------------------------------------------------------------------
 * Extra portfolio projects (lighter, but fully openable) — give the list
 * enough volume to show pagination and a realistic RAK portfolio.
 * ------------------------------------------------------------------------- */
interface MakeArgs {
  id: string
  name: string
  department: string
  contractType: string
  domain: string
  location: string
  description: string
  startYear: number
  startMonthIndex: number
  startMonthLabel: string
  durationMonths: number
  totalBudget: number
  spentBudget?: number
  status: Project['status']
  overallProgress: number
  health: RAG
  healthNote: string
  pm: { name: string; initials: string; color: string }
  equipment?: Equipment[]
}

function makeProject(a: MakeArgs): Project {
  const phases = genericPhases(a.durationMonths)
  const allComplete = a.status === 'completed'
  const builtPhases = phases.map((ph, i) => {
    if (allComplete) return { ...ph, progressPct: 100, status: 'complete' as const }
    if (a.status === 'delivery' && i === 0) return { ...ph, progressPct: a.overallProgress > 0 ? 40 : 0, status: 'in_progress' as const }
    return ph
  })
  const pm: TeamMember = {
    id: `${a.id}-pm`,
    name: a.pm.name,
    role: 'Project Manager',
    access: 'Full access',
    initials: a.pm.initials,
    color: a.pm.color,
    fteByPhase: builtPhases.map(() => 1),
    capacity: 1,
  }
  const splits = builtPhases.map(() => 1 / builtPhases.length)
  return {
    id: a.id,
    name: a.name,
    department: a.department,
    contractType: a.contractType,
    domain: a.domain,
    location: a.location,
    description: a.description,
    startMonthLabel: a.startMonthLabel,
    startYear: a.startYear,
    startMonthIndex: a.startMonthIndex,
    durationMonths: a.durationMonths,
    totalBudget: a.totalBudget,
    spentBudget: a.spentBudget ?? (allComplete ? a.totalBudget : 0),
    pmId: pm.id,
    tags: [a.domain],
    status: a.status,
    overallProgress: a.overallProgress,
    currentPhaseId: allComplete ? builtPhases[builtPhases.length - 1].id : builtPhases[0].id,
    health: a.health,
    healthNote: a.healthNote,
    team: [pm],
    internalStakeholders: [],
    externalPartners: [],
    budgetLines: builtPhases.map((ph, i) => ({ phase: ph.name, allocated: Math.round((a.totalBudget * splits[i]) / 1000) * 1000, category: 'Allocated' })),
    equipment: a.equipment ?? [],
    dependencies: [],
    risks: [],
    assumptions: [],
    phases: builtPhases,
    milestones: [
      { id: 'k', name: 'Kickoff', month: builtPhases[0].startMonth, rag: 'green', state: allComplete ? 'done' : 'scheduled' },
      { id: 'c', name: 'Completion', month: builtPhases[builtPhases.length - 1].endMonth, rag: 'green', state: allComplete ? 'done' : 'scheduled' },
    ],
    issues: [],
    tasks: { todo: allComplete ? 0 : 8, inProgress: a.status === 'delivery' ? 4 : 0, done: allComplete ? 30 : 0 },
    inProgressTasks: [],
    burn: [],
    kpis: [{ label: 'Overall completion', current: a.overallProgress, target: 100, unit: '%' }],
  }
}

const extraProjects: Project[] = [
  makeProject({ id: 'corniche-boardwalk', name: 'RAK Corniche Boardwalk', department: 'RAK Urban Planning Dept', contractType: 'Design-Build', domain: 'Urban Development', location: 'RAK Corniche', description: 'New 4 km waterfront boardwalk with landscaping and public amenities.', startYear: 2026, startMonthIndex: 8, startMonthLabel: 'Sep 2026 (planned)', durationMonths: 18, totalBudget: 58_000_000, status: 'presale', overallProgress: 0, health: 'green', healthNote: 'On track', pm: { name: 'Yousef Karim', initials: 'YK', color: '#3b82f6' } }),
  makeProject({ id: 'julphar-cooling', name: 'Julphar District Cooling', department: 'RAK Public Services Department', contractType: 'EPC — Engineering, Procurement, Construction', domain: 'Energy', location: 'Julphar District, RAK', description: 'District cooling plant and distribution network for the Julphar towers area.', startYear: 2025, startMonthIndex: 9, startMonthLabel: 'Oct 2025', durationMonths: 28, totalBudget: 210_000_000, spentBudget: 64_000_000, status: 'delivery', overallProgress: 31, health: 'amber', healthNote: 'Needs attention', pm: { name: 'Ahmed Al Mansouri', initials: 'AM', color: '#1a2235' },
    equipment: [
      { name: 'CHL-02 Chiller unit', category: 'Mechanical', phase: 'Execution', status: 'In use', utilization: 76, operatorId: 'julphar-cooling-pm', costPerHour: 95, maintenance: 'Up to date' },
      { name: 'CRN-07 Mobile crane', category: 'Heavy plant', phase: 'Execution', status: 'In use', utilization: 62, costPerHour: 110, maintenance: 'Due soon' },
      { name: 'GEN-03 Generator', category: 'Power', phase: 'Execution', status: 'Available', utilization: 40, costPerHour: 35, maintenance: 'Up to date' },
    ] }),
  makeProject({ id: 'schools-solar', name: 'RAK Schools Solar Rollout', department: 'RAK Energy Efficiency Office', contractType: 'Framework', domain: 'Energy', location: '40 schools, RAK', description: 'Rooftop solar PV across 40 public schools with net-metering.', startYear: 2026, startMonthIndex: 1, startMonthLabel: 'Feb 2026', durationMonths: 20, totalBudget: 47_500_000, spentBudget: 6_300_000, status: 'onhold', overallProgress: 12, health: 'red', healthNote: 'At risk', pm: { name: 'Tariq Nasser', initials: 'TN', color: '#e2574c' } }),
  makeProject({ id: 'marjan-drainage', name: 'Marjan Island Drainage', department: 'RAK Public Services Department', contractType: 'PPP — Public-Private Partnership', domain: 'Water', location: 'Al Marjan Island, RAK', description: 'Stormwater drainage and pumping network for Al Marjan Island.', startYear: 2025, startMonthIndex: 3, startMonthLabel: 'Apr 2025', durationMonths: 30, totalBudget: 162_000_000, spentBudget: 88_000_000, status: 'delivery', overallProgress: 54, health: 'green', healthNote: 'On track', pm: { name: 'Ahmed Al Mansouri', initials: 'AM', color: '#1a2235' },
    equipment: [
      { name: 'EXC-210 Excavator', category: 'Excavators', phase: 'Execution', status: 'In use', utilization: 84, operatorId: 'marjan-drainage-pm', costPerHour: 66, maintenance: 'Up to date' },
      { name: 'PMP-04 Dewatering pump', category: 'Pumps', phase: 'Execution', status: 'Maintenance', utilization: 0, costPerHour: 22, maintenance: 'Overdue' },
    ] }),
  makeProject({ id: 'heritage-souq', name: 'Heritage Souq Restoration', department: 'RAK Urban Planning Dept', contractType: 'Design-Build', domain: 'Buildings', location: 'Old Town, RAK', description: 'Restoration of the historic souq with conservation-grade works.', startYear: 2025, startMonthIndex: 0, startMonthLabel: 'Jan 2025', durationMonths: 11, totalBudget: 33_400_000, status: 'completed', overallProgress: 100, health: 'green', healthNote: 'Completed', pm: { name: 'Maryam Ali', initials: 'MA', color: '#f0a830' } }),
  makeProject({ id: 'smart-traffic', name: 'RAK Smart Traffic — Phase 1', department: 'RAK Urban Planning Dept', contractType: 'Design-Build', domain: 'Transport', location: 'City-wide, RAK', description: 'Adaptive traffic signals and sensors across 25 key intersections.', startYear: 2026, startMonthIndex: 10, startMonthLabel: 'Nov 2026 (planned)', durationMonths: 16, totalBudget: 29_000_000, status: 'presale', overallProgress: 0, health: 'green', healthNote: 'On track', pm: { name: 'Hessa Rashed', initials: 'HR', color: '#3b82f6' } }),
]

export const allProjects: Project[] = [rakProject, alHamraProject, barjeelProject, ...extraProjects]
