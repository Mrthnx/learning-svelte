# ViewModels Documentation

Esta documentación describe todos los ViewModels disponibles en el backend para que el equipo de frontend pueda trabajar correctamente con los datos.

## Índice

- [Autenticación y Usuarios](#autenticación-y-usuarios)
- [Jerarquía Organizacional](#jerarquía-organizacional)
- [Assets y Sensores](#assets-y-sensores)
- [Mediciones y Datos](#mediciones-y-datos)
- [Frecuencias de Falla](#frecuencias-de-falla)
- [Reportes y Análisis](#reportes-y-análisis)
- [Componentes y Tecnologías](#componentes-y-tecnologías)
- [Alarmas y Eventos](#alarmas-y-eventos)
- [Configuración y Administración](#configuración-y-administración)
- [Utilidades y Helpers](#utilidades-y-helpers)

---

## Autenticación y Usuarios

### LoginViewModel
Credenciales de inicio de sesión.
```typescript
{
  email?: string;
  password?: string;
}
```

### LoginResponseViewModel
Respuesta exitosa de autenticación.
```typescript
{
  ok: boolean;
  id: number;
  language?: number;
  dateFormat?: string;
  user?: UserLoginViewModel;
  token?: string;
  menu?: MenuViewModel[];
  is2FA?: boolean;
  name?: string;
  phone?: string;
}
```

### UserLoginViewModel
Información del usuario autenticado.
```typescript
{
  id: number;
  email?: string;
  name?: string;
  country?: number;
  image?: string;
  language?: string;
  nameCompany?: string;
  addressCompany?: string;
  footerCompany?: string;
  imageCompany?: string;
  role?: RoleLoginViewModel;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  system?: SystemViewModel;
}
```

### UserViewModel
Modelo completo de usuario con todas sus propiedades.
```typescript
{
  id: number;
  code?: string;
  email?: string;
  password?: string;
  name?: string;
  country?: number;
  city?: string;
  province?: string;
  hash?: string;
  address?: string;
  zip?: string;
  phone?: string;
  countryPhoneCode?: string;
  countryCode?: string;
  phoneConfirmed?: boolean;
  image?: string;
  role?: RoleViewModel;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  system?: SystemViewModel;
  passwordValidate?: boolean | string;
  twoFactorAuth?: boolean | string;
  allowAlarmsSentSms?: boolean | string;
  allowAlarmsSentEmail?: boolean | string;
  allowCommentAlarmsSentEmail?: boolean | string;
  allowCommentAlarmsSentSms?: boolean | string;
  languagePreference?: string;
  description?: string;
  isBlocked?: boolean | string;
  imageCompany?: string;
  nameCompany?: string;
  addressCompany?: string;
  footerCompany?: string;
  company?: number;
}
```

### UpdatePasswordViewModel
Para actualizar contraseña de usuario.
```typescript
{
  id: number;
  currentPassword?: string;
  password?: string;
  confirmPassword?: string;
  hash?: string;
}
```

### ValidatePasswordViewModel
Para validar contraseña.
```typescript
{
  id: number;
  password?: string;
}
```

### SmsUserViewmodel
Para autenticación de dos factores vía SMS.
```typescript
{
  idUser: number;
  phone?: string;
  smsCode?: string;
  password?: string;
  email?: string;
  hash?: string;
}
```

---

## Jerarquía Organizacional

### AccountViewModel
Nivel superior de la jerarquía organizacional.
```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  nameContactor?: string;
  telephoneContactor?: string;
  mailContactor?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  users?: UserViewModel[];
  plants?: PlantViewModel[];
  account?: AccountViewModel;
}
```

### PlantViewModel
Plantas dentro de una cuenta.
```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  nameContactor?: string;
  telephoneContactor?: string;
  mailContactor?: string;
  order?: number;
  latitude?: number;
  longitude?: number;
  amplitude?: number;
  frequency?: number;
  velocityType?: number;
  displacementType?: number;
  accelerationType?: number;
  language?: number;
  dateFormat?: string;
  frequencyValue?: number;
  gmt?: string;
  image?: string;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  areas?: AreaViewModel[];
}
```

### PlantOffLineViewModel
Vista simplificada de planta para modo offline.
```typescript
{
  id?: number;
  code?: string;
  description?: string;
  order?: number;
  account?: {
    id?: number;
    description?: string;
  };
}
```

### AreaViewModel
Áreas dentro de una planta.
```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  nameContactor?: string;
  telephoneContactor?: string;
  mailContactor?: string;
  order?: number;
  latitude?: number;
  longitude?: number;
  image?: string;
  plant?: PlantViewModel;
  systems?: SystemViewModel[];
}
```

### SystemViewModel
Sistemas dentro de un área.
```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  nameContactor?: string;
  telephoneContactor?: string;
  mailContactor?: string;
  order?: number;
  latitude?: number;
  longitude?: number;
  image?: string;
  wifiSsid?: string;
  wifiPassword?: string;
  area?: AreaViewModel;
  mawois?: MawoiViewModel[];
}
```

---

## Assets y Sensores

### MawoiViewModel
Modelo principal de asset/equipo (Machine Asset Without Identification).
```typescript
{
  id: number;
  code?: string;
  alarmFactor?: number;
  description?: string;
  order?: number;
  text?: string;
  currentState?: string;
  component?: string;
  criticality?: number;
  latitude?: number;
  longitude?: number;
  alarmLevel?: string;
  lastSurveyDate?: string;
  temperature?: number;
  surveyTime?: number;
  box?: string;
  isMawoiOn?: boolean;
  showPoints?: string;
  images?: string[];
  bands?: BandViewModel[];
  pointsBandSet?: PointBandSetQueryResult[];
  system?: SystemViewModel;
  points?: PointViewModel[];
  typicalMawoi?: TypicalMawoiViewModel;
  basedMawoi?: MawoiViewModel;
  bandId?: number;
  updateOrder?: boolean;
  reference?: number;
  typeAlarm?: string;
  vistaContent?: VistasContentViewModel;
  firmware?: string;
  fileFirmware?: any;
  components?: ComponentViewModel[];
  isSelectRoute?: boolean;
  onlyWithImages?: boolean;
  formatDate?: string;
  useNoiseFilter?: boolean;
  typicalMawoiId?: number;
  isMonoaxial?: boolean;
  isClasic?: boolean;
  isFromMobile?: boolean;
  mode?: string;
  intervalTime?: number;
  alarmByOverall?: boolean;
  showOldPoints?: boolean;
  threshold?: number;
}
```

### MawoiFrequencyViewModel
Frecuencias asociadas a un asset.
```typescript
{
  id: number | null;
  mawoi?: MawoiViewModel;
  frequency?: number;
  reduction?: number;
  deleted?: boolean;
}
```

### MawoiLocationUpdateViewModel
Para actualizar ubicación de un asset.
```typescript
{
  latitude?: number;
  longitude?: number;
}
```

### MawoiHierarchyCountsViewModel
Conteos de alarmas por jerarquía organizacional.
```typescript
interface AlarmCounts {
  D: number; // Danger
  W: number; // Warning  
  N: number; // Normal
}

interface MawoiSummary {
  id: number;
  code: string;
  description: string;
  alarmLevel: string | null;
  order: number;
}

interface SystemHierarchy {
  id: number;
  description: string;
  mawois: { [mawoiId: number]: MawoiSummary };
  totalMawois: number;
  alarmCounts: AlarmCounts;
}

interface AreaHierarchy {
  id: number;
  description: string;
  systems: { [systemId: number]: SystemHierarchy };
  totalMawois: number;
  alarmCounts: AlarmCounts;
}

interface PlantHierarchy {
  id: number;
  description: string;
  areas: { [areaId: number]: AreaHierarchy };
  totalMawois: number;
  alarmCounts: AlarmCounts;
}

interface AccountHierarchy {
  id: number;
  description: string;
  plants: { [plantId: number]: PlantHierarchy };
  totalMawois: number;
  alarmCounts: AlarmCounts;
}

interface MawoiCountsByHierarchyResponse {
  [accountId: number]: AccountHierarchy;
}

interface HierarchyFilters {
  accountId?: number;
  plantId?: number;
  areaId?: number;
  systemId?: number;
}
```

### PointViewModel
Puntos de medición dentro de un asset.
```typescript
{
  id: number | null;
  faultFrequency?: string;
  alarmLevel?: string;
  code?: string;
  description?: string;
  order?: number;
  recomendation?: string;
  rpm?: number;
  axis?: number;
  tempFactor?: number;
  lubricant?: string;
  fmax?: string;
  id_sensor_type?: number;
  images?: string[];
  faultfreqs?: FaultFrequencyViewModel[];
  mawoi?: MawoiViewModel;
  calibratingTemp?: number;
  sensor_type?: SensorTypeViewModel;
  firmware?: string;
  fileFirmware?: any;
  varRpm?: number;
  varFmax?: number;
  varLines?: number;
  varRev?: number;
  varSamples?: number;
  bandsInfo?: any;
  lastBandInfo?: any;
  sensitivity?: number;
  mode?: string;
  tracker?: TrackerViewModel;
}
```

### PointOfflineViewModel
Vista de punto para modo offline.
```typescript
{
  pointId?: number;
  pointCode?: string;
  pointDescription?: string;
  pointRpm?: number;
  pointOrder?: number;
  varRpm?: number;
  varFmax?: number;
  frequencyUnits?: string;
  varLines?: number;
  varRev?: number;
  varSamples?: number;
  mawoiId?: number;
  mawoiCode?: string;
  mawoiIsMonoaxial?: boolean;
  mawoiDescription?: string;
  mawoiTypicalId?: number;
  systemId?: number;
  systemCode?: string;
  systemDescription?: string;
  areaId?: number;
  areaCode?: string;
  areaDescription?: string;
  plantId?: number;
  plantCode?: string;
  plantLatitude?: number;
  plantLongitude?: number;
  plantDescription?: string;
}
```

### SensorTypeViewModel
Tipos de sensores disponibles.
```typescript
{
  id: number;
  description?: string;
  state?: boolean;
}
```

### TrackerViewModel
Seguimiento de frecuencias específicas.
```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  type?: number;
  pointCode?: string;
  mawoi?: MawoiViewModel;
  account?: AccountViewModel;
}
```

### AssetLocationViewModel
Ubicación de assets en rutas.
```typescript
{
  id?: number;
  timestamp?: Date;
  latitude?: number;
  longitude?: number;
  rowMawoi?: number;
  type?: 'START' | 'END';
}
```

---

## Mediciones y Datos

### BandViewModel
Mediciones de bandas espectrales.
```typescript
{
  id?: number;
  bandTimestamp?: string;
  overall?: number;
  band1?: number;
  band2?: number;
  band3?: number;
  band4?: number;
  band5?: number;
  band6?: number;
  hiFrequency1?: number;
  hiFrequency2?: number;
  hiFrequency3?: number;
  peakToPeak?: number;
  crestFactor?: number;
  temperature?: number;
  text?: string;
  textVisible?: boolean;
  user?: string;
  rpm?: number;
  date?: Date;
  point?: PointViewModel;
  survey?: SurveyViewModel;
}
```

### BandInformationViewModel
Información detallada de bandas con sub-bandas.
```typescript
{
  bandId: number | null;
  pointId?: number;
  pointCode?: string;
  pointDescription?: string;
  pointRpm?: number;
  pointOrder: number;
  mawoiId?: number;
  mawoiCode?: string;
  mawoiDescription?: string;
  amplitude?: number;
  frequency?: number;
  surveyId?: number;
  surveyMeasureTimestamp?: string;
  surveyMeasureFormatTimestamp?: string;
  overall?: number;
  overallAcc?: number;
  overallDisp?: number;
  analogOverall?: number;
  hiFrequency1?: number;
  hiFrequency2?: number;
  hiFrequency3?: number;
  peakToPeak?: number;
  crestFactor?: number;
  temperature?: number;
  tempFactor?: number;
  rpm?: number;
  alarmValue?: number;
  text?: string;
  commentDate?: string;
  commentBandId?: number;
  textVisible?: boolean;
  accelerationType?: number;
  velocityType?: number;
  displacementType?: number;
  bands: SubBand[];
  notes?: {
    pointCode?: string;
    pointDescription?: string;
    codes?: string[];
  };
  isEmpty?: boolean;
  isOnlyNotes?: boolean;
  isHertz?: boolean;
}

interface SubBand {
  id?: number;
  code?: string;
  label?: string;
  value?: number;
  visible?: boolean;
}
```

### BandCommentViewmodel
Comentarios en bandas de medición.
```typescript
{
  bandId?: number;
  pointId?: number;
  pointCode?: string;
  text?: string;
  overall?: number;
  temperature?: number;
}
```

### SurveyViewModel
Encuestas/mediciones realizadas.
```typescript
{
  id: number | null;
  measureTimestamp?: Date | string;
  measureFormatTimestamp?: string;
  initDate?: Date | string;
  endDate?: Date | string;
  isReference?: boolean;
  mawoi?: MawoiViewModel;
  isTracker?: boolean;
  comment?: string;
  failure?: PlantFailureViewModel;
  alarm?: PlantAlarmCodeViewModel;
  _alarmCode?: any;
  _failureMode?: any;
  summary?: string;
}
```

### HistoryOverallsViewModel
Histórico de valores globales.
```typescript
{
  id: number | null;
  temperature?: number;
  overallAcceleration?: number;
  overallVelocity?: number;
  survey?: SurveyViewModel;
}
```

### LatestTimestampDataViewModel
Última data de timestamp recibida.
```typescript
{
  assetId?: number;
  assetDescription?: string;
  pointId?: number;
  pointDescription?: string;
  latestTimestamp?: Date;
  latestVoltage?: number;
  latestRssi?: number;
}
```

### AssetLatestTimestampDataViewModel
Data agrupada por asset.
```typescript
{
  assetId?: number;
  assetDescription?: string;
  points?: PointLatestTimestampDataViewModel[];
}

interface PointLatestTimestampDataViewModel {
  pointId?: number;
  pointDescription?: string;
  latestTimestamp?: Date;
  latestVoltage?: number;
  latestRssi?: number;
}
```

### DataPointViewModel
Punto de dato genérico para gráficas.
```typescript
{
  x?: X;
  y?: Y;
  surveyId?: number;
  bandId?: number;
}
```

### DataSetModel
Conjunto de datos para gráficas.
```typescript
{
  id?: number;
  label?: string;
  subtitle?: string;
  subtitle_2?: string;
  data?: DataPointViewModel<X, Y>[];
  extraData?: any;
  isMetric?: boolean;
  isHertz?: boolean;
  overallAcc?: number;
  overall?: number;
  crestFactor?: number;
  peakToPeak?: number;
}
```

---

## Frecuencias de Falla

### FaultFrequencyViewModel
Frecuencias de falla configuradas para un punto.
```typescript
{
  id: number;
  faultFrequencyId?: string;
  synchronou1?: SynchronouViewModel;
  synchronou2?: SynchronouViewModel;
  synchronou3?: SynchronouViewModel;
  blade1?: BladeViewModel;
  bearing1?: BearingViewModel;
  bearing2?: BearingViewModel;
  gearbox1?: GearboxViewModel;
  belt1?: BeltViewModel;
  chain1?: ChainViewModel;
  fixedFrequency1?: FixedFrequencyViewModel;
  bearingIds?: string;
  beltIds?: string;
  bladeIds?: string;
  chainIds?: string;
  fixesIds?: string;
  gearboxesIds?: string;
  synchronousIds?: string;
  point?: PointViewModel;
  bearings?: FaultFrequencyBearingsViewModel[];
  belts?: FaultFrequencyBeltsViewModel[];
  blades?: FaultFrequencyBladesViewModel[];
  chains?: FaultFrequencyChainsViewModel[];
  fixedFrequencys?: FaultFrequencyFixesViewModel[];
  gearboxes?: FaultFrequencyGearboxesViewModel[];
  synchronous?: FaultFrequencySynchonousViewModel[];
}
```

### BearingViewModel
Rodamientos.
```typescript
{
  id: number | null;
  mnfCode?: string;
  label?: string;
  bearingBr?: number;
  ftf?: number;
  bsf?: number;
  bpfo?: number;
  bpfi?: number;
  lastHarmonic?: number;
  d1?: number;
  d2?: number;
  numberOfRolls?: number;
  angle?: number;
  diameterOfBalls?: number;
}
```

### BeltViewModel
Correas/bandas.
```typescript
{
  id: number | null;
  beltId?: string;
  shaft1?: number;
  shaft2?: number;
  lc?: number;
  l?: number;
  lastHarmonic?: number;
  plant?: PlantViewModel;
  frequency?: number;
}
```

### BladeViewModel
Aspas/palas.
```typescript
{
  id: number | null;
  bladeId?: string;
  numberOfBlades?: number;
  lastHarmonic?: number;
  plant?: PlantViewModel;
}
```

### ChainViewModel
Cadenas.
```typescript
{
  id: number | null;
  chainId?: string;
  s1?: number;
  s2?: number;
  lc?: number;
  lastHarmonic?: number;
  plant?: PlantViewModel;
  frequency?: number;
}
```

### GearboxViewModel
Cajas de engranajes.
```typescript
{
  id: number | null;
  gearboxId?: string;
  lastHarmonic?: number;
  numberZ?: number;
  z1?: number;
  z2?: number;
  z3?: number;
  z4?: number;
  z5?: number;
  z6?: number;
  z7?: number;
  z8?: number;
  z9?: number;
  z10?: number;
  z11?: number;
  z12?: number;
  plant?: PlantViewModel;
}
```

### SynchronouViewModel
Frecuencias síncronas.
```typescript
{
  id: number | null;
  label?: string;
  firstHarmonic?: number;
  lastHarmonic?: number;
  plant?: PlantViewModel;
}
```

### FixedFrequencyViewModel
Frecuencias fijas.
```typescript
{
  id: number | null;
  fixedFrequencyId?: string;
  freq1?: number;
  freq2?: number;
  freq3?: number;
  lastHarmonic?: number;
  plant?: PlantViewModel;
}
```

### FaultFrequencyResponse
Respuesta consolidada de frecuencias de falla.
```typescript
{
  code: string;
  synchronous: SynchronouResponse[];
  blades: BladeResponse[];
  bearings: BearingResponse[];
  gearboxes: GearboxResponse[];
  belts: BeltResponse[];
  chains: ChainResponse[];
  fixedFrequencies: FixedFrequencyResponse[];
}
```

---

## Reportes y Análisis

### ComponentReportViewmodel
Reporte de componente.
```typescript
{
  id: number | null;
  surveyData?: ComponentSurveyDataViewmodel;
  component?: ComponentViewModel;
  background?: string;
  vibrationSpectra?: string;
  impactTest?: string;
  overall?: string;
  summary?: string;
  recommendation?: string;
}
```

### ComponentAlignmentReportViewmodel
Reporte de alineación.
```typescript
{
  id: number | null;
  surveyData?: ComponentSurveyDataViewmodel;
  date?: Date;
  po?: string;
  nameAddress?: string;
  location?: string;
  speed?: string;
  verticalInitAng?: number;
  verticalInitOff?: number;
  horizontalInitAng?: number;
  horizontalInitOff?: number;
  verticalEndAng?: number;
  verticalEndOff?: number;
  horizontalEndAng?: number;
  horizontalEndOff?: number;
  frontVertical?: number;
  rearVertical?: number;
  frontHorizontal?: number;
  rearHorizontal?: number;
  remarks?: string;
}
```

### ComponentBalancingReportViewmodel
Reporte de balanceo.
```typescript
{
  id: number | null;
  surveyData?: ComponentSurveyDataViewmodel;
  isShop?: boolean;
  date?: Date;
  po?: string;
  nameAddress?: string;
  rotorSpeed?: number;
  rotorWeight?: number;
  grade?: number;
  specificTolerance?: number;
  tolerance?: number;
  initPlanOne?: number;
  initPlanTwo?: number;
  endPlanOne?: number;
  endPlanTwo?: number;
  weightPlanOne?: number;
  weightPlanTwo?: number;
  location?: string;
  speed?: number;
  weight?: number;
  remarks?: string;
  foundPlanOneX?: number;
  foundPlanTwoX?: number;
  foundPlanOneY?: number;
  foundPlanTwoY?: number;
  leftPlanOneV?: number;
  leftPlanTwoV?: number;
  leftPlanOneH?: number;
  leftPlanTwoH?: number;
  componentTypeId?: number;
}
```

### ComponentReportDataAnalysisViewmodel
Análisis de datos de reporte.
```typescript
{
  id: number | null;
  componentReport?: ComponentReportViewmodel;
  image?: string;
  title?: string;
  description?: string;
}
```

### ComponentReportAttachmentViewmodel
Adjuntos de reportes.
```typescript
{
  id: number | null;
  componentReport?: ComponentReportViewmodel;
  attachment?: string;
}
```

### AssetReliabilityReportViewmodel
Reporte de confiabilidad de assets.
```typescript
{
  id: number;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  date?: Date;
  color?: string;
  vib?: number;
  trib?: number;
  mce?: number;
  irrot?: number;
  irelec?: number;
  irstruc?: number;
  uerot?: number;
  ueelec?: number;
  ueleak?: number;
  rotating?: number;
  electrical?: number;
  structural?: number;
}
```

### TribologyViewModel
Datos de análisis tribológico con clasificaciones.
```typescript
{
  componentSurvey?: ComponentSurveyDataViewmodel;
  lubePointId?: number;
  // Propiedades con valor y clase (ej: viscosity40 y viscosity40Class)
  viscosity40?: number;
  viscosity40Class?: string;
  viscosity100?: number;
  viscosity100Class?: string;
  // ... (más de 50 propiedades para análisis de aceite)
  // Incluye elementos químicos, contaminación, desgaste, etc.
}
```

### AnalysisDataTribologyViewmodel
Datos completos de análisis tribológico.
```typescript
{
  id: number | null;
  componentSurvey?: ComponentSurveyDataViewmodel;
  sampleId?: string;
  mawoi?: any;
  lubePointId?: number;
  viscosity40?: number;
  viscosity100?: number;
  viscosityindex?: number;
  hydroxy?: number;
  oxidation?: number;
  nitration?: number;
  antiwearloss?: number;
  oxidationSulfate?: number;
  tan?: number;
  tbn?: number;
  fuelPercvol?: string;
  solidPercvol?: string;
  waterPercvol?: string;
  waterPPM?: string;
  // Elementos químicos (mg, cd, mn, ca, ba, p, zn, si, na, k, b, etc.)
  // Metales de desgaste (fe, cr, mo, al, cu, pb, sn, ag, ni, v, ti)
  // Conteo de partículas (wpcount, iso4um-40um, pcount4um-40um)
  surveyDataDate?: string;
  isBase?: boolean;
  lubricantId?: number;
}
```

### UserBriefReportViewModel
Configuración de reporte breve de usuario.
```typescript
{
  id: number;
  user?: UserViewModel;
  alarmColor?: boolean;
  alarm?: boolean;
  tech?: boolean;
  assetId?: boolean;
  assetDescription?: boolean;
  compId?: boolean;
  compDescription?: boolean;
  failure?: boolean;
  date?: boolean;
}
```

### UserDetailedReportViewModel
Configuración de reporte detallado.
```typescript
{
  id: number;
  user?: UserViewModel;
  alarmColor?: boolean;
  alarm?: boolean;
  tech?: boolean;
  assetId?: boolean;
  assetDescription?: boolean;
  compId?: boolean;
  compDescription?: boolean;
  failure?: boolean;
  date?: boolean;
  summary?: boolean;
}
```

### UserComponentReportViewModel
Secciones visibles en reporte de componente.
```typescript
{
  id: number;
  user?: UserViewModel;
  background?: boolean;
  asset?: boolean;
  abstract?: boolean;
  overall?: boolean;
  dataAnalysis?: boolean;
  summary?: boolean;
}
```

---

## Componentes y Tecnologías

### ComponentViewModel
Componentes del sistema.
```typescript
{
  id: number | null;
  componentType?: ComponentTypeViewModel;
  mawoi?: MawoiViewModel;
  lubricant?: LubricantViewModel;
  code?: string;
  name?: string;
  description?: string;
  vib?: number;
  trib?: number;
  irrot?: number;
  irelec?: number;
  irstruc?: number;
  uerot?: number;
  ueelec?: number;
  ueleak?: number;
  mce?: number;
  bal?: number;
  algn?: number;
  vibdate?: Date;
  vibalarm?: PlantAlarmCodeViewModel;
  tribdate?: Date;
  tribalarm?: PlantAlarmCodeViewModel;
  mcedate?: Date;
  mcealarm?: PlantAlarmCodeViewModel;
  irrotdate?: Date;
  irrotalarm?: PlantAlarmCodeViewModel;
  irelecdate?: Date;
  irelecalarm?: PlantAlarmCodeViewModel;
  irstrucdate?: Date;
  irstrucalarm?: PlantAlarmCodeViewModel;
  uerotdate?: Date;
  uerotalarm?: PlantAlarmCodeViewModel;
  ueelecdate?: Date;
  ueelecalarm?: PlantAlarmCodeViewModel;
  ueleakdate?: Date;
  ueleakalarm?: PlantAlarmCodeViewModel;
  algndate?: Date;
  algnalarm?: PlantAlarmCodeViewModel;
  baldate?: Date;
  balalarm?: PlantAlarmCodeViewModel;
  vibface?: string;
  existSummary?: boolean;
  color?: string;
  date?: string;
  tech?: number;
}
```

### ComponentTypeViewModel
Tipos de componentes.
```typescript
{
  id: number | null;
  code?: string;
  parent?: number;
  components?: ComponentViewModel[];
}
```

### ComponentTechnologyViewmodel
Tecnologías de mantenimiento.
```typescript
{
  id: number | null;
  code?: string;
  description?: string;
}
```

### ComponentTechnologyAttachmentViewModel
Adjuntos de tecnología.
```typescript
{
  id: number | null;
  attachment?: string;
  surveyData?: ComponentSurveyDataViewmodel;
}
```

### ComponentSurveyDataViewmodel
Datos de encuesta de componente.
```typescript
{
  id: number | null;
  component?: ComponentViewModel;
  technology?: ComponentTechnologyViewmodel;
  lubricant?: PlantLubricantViewModel;
  alarmCode?: PlantAlarmCodeViewModel;
  failureMode?: PlantFailureViewModel;
  wonum?: string;
  date?: any;
  report?: ComponentReportViewmodel;
  attachment?: ComponentTechnologyAttachmentViewModel;
  assessment?: string;
  isbase?: boolean;
}
```

### ComponentFailureGroupViewModel
Grupos de falla.
```typescript
{
  id: number | null;
  description?: string;
  technology?: ComponentTechnologyViewmodel;
}
```

### ComponentFailureModeViewmodel
Modos de falla.
```typescript
{
  id: number | null;
  description?: string;
  failureGroup?: ComponentFailureGroupViewModel;
}
```

---

## Alarmas y Eventos

### AlarmCodeViewModel
Códigos de alarma del sistema.
```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  weight?: string;
  face?: string;
  cell?: string;
  color?: string;
}
```

### PlantAlarmCodeViewModel
Códigos de alarma específicos por planta.
```typescript
{
  id: number | null;
  plant?: PlantViewModel;
  alarmCode?: AlarmCodeViewModel;
  code?: string;
  description?: string;
  remarks?: string;
  color?: string;
  weight?: number;
}
```

### AlarmCustomSurveyResponseViewModel
Respuesta personalizada de alarmas de encuesta.
```typescript
{
  mawois: AlarmCustomSurveyMawoiViewModel[];
}

interface AlarmCustomSurveyMawoiViewModel {
  id: number;
  code?: string;
  description?: string;
  order?: number;
  alarmByOverall?: boolean;
  alarmByOverallAcc?: boolean;
  alarmByTemp?: boolean;
  alarmByPkpk?: boolean;
  points?: AlarmCustomSurveyPointViewModel[];
}

interface AlarmCustomSurveyPointViewModel {
  id: number;
  code?: string;
  description?: string;
  order?: number;
  goodThreshold?: number | null;
  warningThreshold?: number | null;
  errorThreshold?: number | null;
  idThreshold?: number | null;
  accGoodThreshold?: number | null;
  accWarningThreshold?: number | null;
  accErrorThreshold?: number | null;
  tempGoodThreshold?: number | null;
  tempWarningThreshold?: number | null;
  tempErrorThreshold?: number | null;
  pkpkGoodThreshold?: number | null;
  pkpkWarningThreshold?: number | null;
  pkpkErrorThreshold?: number | null;
}
```

### PlantFailureViewModel
Modos de falla por planta.
```typescript
{
  id: number | null;
  plant?: PlantViewModel;
  technology?: ComponentTechnologyViewmodel;
  code?: string;
  description?: string;
  order?: number;
  state: boolean;
}
```

### NotificationViewModel
Notificaciones del sistema.
```typescript
{
  id: number | null;
  name?: string;
  type?: string;
  body?: string;
  date?: Date;
  destination?: string;
  user?: UserViewModel;
}
```

### MawoiEvent
Eventos de assets.
```typescript
{
  id: number | null;
  start?: any;
  end?: any;
  title?: string;
  automatic?: boolean;
  mawoi?: MawoiViewModel;
}
```

### SystemEvent
Eventos de sistemas.
```typescript
{
  id: number | null;
  start?: any;
  end?: any;
  title?: string;
  automatic?: boolean;
  system?: SystemViewModel;
}
```

### EventExclusionViewModel
Exclusiones de eventos.
```typescript
{
  id: number;
  scheduleTimestamp?: Date;
  description?: string;
}
```

---

## Configuración y Administración

### RoleViewModel
Roles de usuario.
```typescript
{
  id: number;
  name?: string;
  level?: number;
}
```

### RoleLoginViewModel
Rol en respuesta de login.
```typescript
{
  name?: string;
  level?: number;
}
```

### MenuViewModel
Estructura de menús.
```typescript
{
  label?: string;
  icon?: string;
  uri?: string;
  level?: number;
  order?: number;
  parentOption?: number;
  menus?: MenuViewModel[];
  permissions: string[];
}
```

### RolePermissionViewModel
Permisos de rol.
```typescript
{
  name?: string;
  level?: number;
  menus?: MenuViewModel[];
}
```

### PermissionViewModel
Permisos individuales.
```typescript
{
  id: number;
  name: string;
}
```

### OptionViewModel
Opciones de menú.
```typescript
{
  id: number;
  name: string;
  icon?: string;
  uri?: string;
  order?: number;
  parentOption?: number;
  children?: OptionViewModel[];
}
```

### RoleWithPermissionsViewModel
Rol con todos sus permisos.
```typescript
{
  role: RoleDetailViewModel;
  permissions: RolePermissionDetailViewModel[];
}
```

### ConfigFirmwareViewModel
Configuración de firmware.
```typescript
{
  ssid?: string;
  password?: string;
  dc_time?: string;
  client_id?: string;
  sensor_module?: string;
  row_mawoi_1?: string;
  row_mawoi_2?: string;
  row_mawoi_3?: string;
}
```

### BandPlantSetViewModel
Conjuntos de bandas por planta.
```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  frequencyUnits?: string;
  linesNumber?: number;
  minFrequency?: number;
  maxFrequency?: number;
  averagesSize?: number;
  averagesMode?: string;
  windowType?: string;
  waveformType?: string;
  waveformBaseRev?: number;
  waveformFreqLines?: number;
  waveformSamplingPoints?: number;
  plant?: PlantViewModel;
  account?: AccountViewModel;
  definitions?: BandPlantSetDefinitionViewModel[];
}
```

### BandPlantSetDefinitionViewModel
Definiciones de bandas.
```typescript
{
  id: number | null;
  code?: string;
  label?: string;
  upper?: number;
  lower?: number;
  remove: boolean;
}
```

### LubricantViewModel
Lubricantes.
```typescript
{
  id: number | null;
  code?: string;
  description?: string;
}
```

### PlantLubricantViewModel
Lubricantes por planta.
```typescript
{
  id: number | null;
  plant?: PlantViewModel;
  lubricant?: LubricantViewModel;
  code?: string;
  description?: string;
  text?: string;
  link?: string;
  attachment?: string;
}
```

### UserTechnologyViewModel
Tecnologías visibles para usuario.
```typescript
{
  id: number;
  user?: UserViewModel;
  component?: boolean;
  type?: boolean;
  vib?: boolean;
  trib?: boolean;
  mce?: boolean;
  bal?: boolean;
  algn?: boolean;
  irelec?: boolean;
  irrot?: boolean;
  irstruc?: boolean;
  ueelec?: boolean;
  ueleak?: boolean;
  uerot?: boolean;
}
```

### UserReliabilityChartViewmodel
Configuración de gráficos de confiabilidad.
```typescript
{
  id: number;
  user?: UserViewModel;
  barAlarm?: boolean;
  pieAlarm?: boolean;
  horizontalBarFailure?: boolean;
}
```

---

## Rutas y Colección de Datos

### RouteViewModel
Rutas de colección.
```typescript
{
  id: number | null;
  plant?: PlantViewModel;
  user?: UserViewModel;
  technology?: ComponentTechnologyViewmodel;
  workOrder?: string;
  code?: string;
  description?: string;
  interval?: number;
  lastCollected?: Date;
  duration?: number;
}
```

### RouteInstructionViewmodel
Instrucciones de ruta.
```typescript
{
  id: number | null;
  route?: RouteViewModel;
  component?: ComponentViewModel;
  instruction?: string;
}
```

### RouteInstructionPaginateViewmodel
Vista paginada de instrucciones con jerarquía.
```typescript
{
  routeId?: number;
  componentId?: number;
  componentCode?: string;
  componentDescription?: string;
  mawoiId?: number;
  mawoiCode?: string;
  mawoiDescription?: string;
  systemId?: number;
  systemCode?: string;
  systemDescription?: string;
  areaId?: number;
  areaCode?: string;
  areaDescription?: string;
  plantId?: number;
  plantCode?: string;
  plantDescription?: string;
  componentTypeCode?: string;
  instruction?: string;
  instructionId?: number;
  areas?: RouteInstructionPaginateViewmodel[];
  systems?: RouteInstructionPaginateViewmodel[];
  mawois?: RouteInstructionPaginateViewmodel[];
  components?: RouteInstructionPaginateViewmodel[];
  isSelectRoute?: boolean;
  componentType?: string;
}
```

### CollectDataExecutionViewModel
Ejecuciones de colección de datos.
```typescript
{
  id: number | null;
  scheduleTimestamp?: Date;
  description?: string;
}
```

### CollectDataFromToExecutionViewModel
Rango de fechas para colección.
```typescript
{
  from?: Date;
  to?: Date;
}
```

---

## Típicos (Templates)

### TypicalMawoiViewModel
Plantillas de assets.
```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  order?: string;
  audio?: string;
  attachment?: string;
  text?: string;
  image?: string;
  plant?: PlantViewModel;
  basedMawoi?: MawoiViewModel;
  basedTypicalMawoi?: TypicalMawoiViewModel;
  typicalPoints?: TypicalPointViewModel[];
}
```

### TypicalPointViewModel
Plantillas de puntos.
```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  order?: number;
  audio?: string;
  text?: string;
  image?: string;
  timeCollections?: number;
  typicalMawoi?: TypicalMawoiViewModel;
  bandPlantSet?: BandPlantSetViewModel;
  typicalBands?: TypicalBandViewModel[];
  rpm?: number;
}
```

### TypicalBandViewModel
Plantillas de bandas.
```typescript
{
  id: number;
  overall?: number;
  hiFrequency1?: number;
  hiFrequency2?: number;
  hiFrequency3?: number;
  peakToPeak?: number;
  crestFactor?: number;
  temperature?: number;
  flux?: number;
  typicalPoint?: TypicalPointViewModel;
}
```

### TypicalInformationViewModel
Información consolidada de típicos.
```typescript
{
  id?: number;
  code?: string;
  description?: string;
  alarmInfo?: TypicalInformationAlarmViewModel;
  alarmInfo1?: TypicalInformationAlarmViewModel;
  alarmInfo2?: TypicalInformationAlarmViewModel;
  alarmInfo3?: TypicalInformationAlarmViewModel;
  typicalMawoi?: TypicalMawoiViewModel;
  points: TypicalInformationPointViewModel[];
}
```

### TypicalInformationAlarmViewModel
Información de alarmas típicas.
```typescript
{
  a?: TypicalAlarm;
  q?: TypicalAlarm;
  p?: TypicalAlarm;
}

interface TypicalAlarm {
  low?: number;
  high?: number;
}
```

---

## Visualizaciones y Gráficas

### VistasViewModel
Vistas personalizadas.
```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  order?: number;
  image?: string;
  type?: string;
  plant?: PlantViewModel;
  items?: VistasContentViewModel[];
  onlyAlarms?: boolean;
}
```

### VistasContentViewModel
Contenido de vistas.
```typescript
{
  id: number | null;
  positionTop?: number;
  positionLeft?: number;
  description?: string;
  point?: PointViewModel;
  asset?: MawoiViewModel;
  vista?: VistasViewModel;
  vistaChild?: VistasViewModel;
  comments?: any;
  eliminar?: boolean;
  overall?: number;
  temperature?: number;
  amplitude?: number;
  accelerationType?: string;
}
```

### SpectraChartViewModel
Configuración de gráfica de espectros.
```typescript
{
  surveys: string[];
  points: string[];
  activeType?: number;
  applyFilter?: boolean;
}
```

### SpectraInformationViewModel
Información de espectros.
```typescript
{
  surveyId?: number;
  plantId?: number;
  pointId?: number;
  pointCode?: string;
  gmt?: string;
  dateFormat?: string;
  surveyMeasureTimestamp?: Date;
  type: string; // 'waveform'
  measureValueX?: number;
  measureValueY?: number;
  velocityType?: number;
  accelerationType?: number;
  displacementType?: number;
  mawoiCode?: string;
  mawoiDescription?: string;
  amplitude?: number;
  areaId?: number;
  systemId?: number;
  frequency?: number;
}
```

### TrendsInformationViewModel
Información de tendencias.
```typescript
{
  pointId?: number;
  pointCode?: string;
  measureType?: string;
  measureTimestamp?: string;
  measureValue?: number;
  mawoiCode?: string;
  mawoiDescription?: string;
  amplitude?: number;
  accelerationType?: number;
  velocityType?: number;
  displacementType?: number;
  surveyId?: number;
  bandId?: number;
}
```

### TrendsSearchViewModel
Búsqueda de tendencias.
```typescript
{
  points: string[];
  types: string[];
  minimumDate?: Date;
  maximumDate?: Date;
}
```

---

## Utilidades y Helpers

### PaginateViewModel<T>
Respuesta paginada genérica.
```typescript
{
  ok: boolean;
  records?: T[];
  total?: number;
}
```

### PaginateRequestViewModel<T>
Petición de paginación.
```typescript
{
  page: number;
  pageSize: number;
  filters?: T;
}
```

### BaseIdViewModel
Modelo base con ID.
```typescript
{
  id?: number;
}
```

### ImageViewModel<E>
Imágenes con relación genérica.
```typescript
{
  id: number | null;
  description?: string;
  uri?: string;
  parent?: E;
}
```

### FileViewModel
Archivos del sistema.
```typescript
{
  id: number | null;
  uri?: string;
  name?: string;
  uuid?: string;
}
```

### UpdateImageViewModel
Para actualizar imágenes.
```typescript
{
  id: number;
  image: string;
}
```

### DateSearchViewModel
Filtro por fechas.
```typescript
{
  startDate?: Date;
  endDate?: Date;
}
```

### UserFilterViewmodel
Filtros de usuario.
```typescript
{
  id?: number;
  accountId?: number;
  plantId?: number;
  areaId?: number;
  systemId?: number;
}
```

---

## Modelos de Búsqueda (Search ViewModels)

La mayoría de entidades tienen un ViewModel de búsqueda que extiende el modelo base y agrega propiedades de filtrado. Estos siguen el patrón `*SearchViewModel`:

- `AccountSearchViewModel`
- `AreaSearchViewModel`
- `BandSearchViewModel`
- `BearingSearchViewModel`
- `BearingDimensionSearchViewModel`
- `BeltSearchViewModel`
- `BladeSearchViewModel`
- `ChainSearchViewModel`
- `ComponentSurveyDataSearchViewmodel`
- `ContactRequestSearchViewModel`
- `FaultfreqSearchViewModel`
- `FixedfreqSearchViewModel`
- `GearboxSearchViewModel`
- `MawoiSearchViewModel`
- `PointSearchViewModel`
- `RouteSearchViewmodel`
- `RouteInstructionSearchViewmodel`
- `SurveySearchViewModel`
- `SynchronouSearchViewModel`
- `SystemSearchViewModel`
- `TypicalBandSearchViewModel`
- `TypicalMawoiSearchViewModel`
- `TypicalPointSearchViewModel`
- `VistasSearchViewModel`

**Patrón común**: Estos modelos incluyen campos de filtrado adicionales como `account`, `plant`, `area`, `system`, fechas de inicio/fin, etc., además de todas las propiedades del modelo base.

---

## Mensajería y Conversaciones

### ConversationViewModel
Conversaciones entre usuarios.
```typescript
{
  id: number | null;
  title?: string;
  isNew?: boolean;
  participants?: ParticipantViewModel[];
  messages?: MessageViewModel[];
}
```

### MessageViewModel
Mensajes en conversaciones.
```typescript
{
  id?: number | null;
  sender?: UserViewModel;
  message?: string;
  conversation?: ConversationViewModel;
  file?: FileViewModel;
}
```

### ParticipantViewModel
Participantes en conversaciones.
```typescript
{
  id: number | null;
  user?: UserViewModel;
}
```

### ContactRequestViewModel
Solicitudes de contacto.
```typescript
{
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}
```

---

## Mediciones Especializadas

### BandSetViewModel
Configuración de conjuntos de bandas.
```typescript
{
  bandId?: number;
  bandInfoId?: number;
  surveyId?: number;
  pointId?: number;
  pointRpm?: number;
  lowerX?: number;
  upperX?: number;
  unit?: number;
}
```

### BandAlarmValue
Valores de alarma de bandas.
```typescript
{
  id?: number;
  code?: string;
  label?: string;
  value?: number;
}
```

### PointBandSetQueryResult
Resultado de consulta de bandas por punto.
```typescript
{
  pointId?: number;
  pointCode?: string;
  pointDescription?: string;
  alarmLevel?: string;
  pointRpm?: number;
  axis?: number;
  bandId: number | null;
  bandDescription?: string | null;
  bandSetMaxFrequency?: number;
  frequencyUnits?: '1' | '2' | '3';
  isAlarmTemp?: boolean;
}
```

### MeasureType
Tipos de medición.
```typescript
{
  id: string | number;
  field: string;
  displayName: string;
}
```

---

## Confiabilidad

### ReliabilityFailuresViewmodel
Fallas agrupadas.
```typescript
{
  description?: string;
  count?: number;
}
```

### AssetReliabilitySurveyViewmodel
Encuestas de confiabilidad.
```typescript
{
  id: number;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  survey?: ComponentSurveyDataViewmodel;
  date?: Date;
}
```

### SurveyDataReportViewmodel
Datos de reporte de encuestas.
```typescript
{
  surveyDataId?: number;
  technologyId?: number;
  plantId?: number;
  areaId?: number;
  alarmCodeColor?: string;
  date?: string;
}
```

### SurveyDataReportGroupAreaViewmodel
Agrupación por área con contadores por tecnología.
```typescript
{
  areaId?: number;
  plantId?: number;
  surveys?: SurveyDataReportViewmodel[];
  VIB?: ValueForColorInTech;
  TRIB?: ValueForColorInTech;
  IRROT?: ValueForColorInTech;
  IRRELEC?: ValueForColorInTech;
  IRSTRUC?: ValueForColorInTech;
  UEROT?: ValueForColorInTech;
  UEELEC?: ValueForColorInTech;
  UELEAK?: ValueForColorInTech;
  MCE?: ValueForColorInTech;
  BALANCING?: ValueForColorInTech;
  ALIGNMENT?: ValueForColorInTech;
  ROTATING?: ValueForColorInTech;
  ELECTRICAL?: ValueForColorInTech;
  STRUCTURAL?: ValueForColorInTech;
}

interface ValueForColorInTech {
  RED: number;
  YELLOW: number;
  GREEN: number;
}
```

---

## Filtros y Configuraciones

### SurveyFilterViewModel
Filtros de encuestas.
```typescript
{
  quantity?: number;
  startDate?: Date;
  endDate?: Date;
  type?: String;
}
```

### EventSearchViewmodel
Búsqueda de eventos.
```typescript
{
  from?: Date;
  to?: Date;
}
```

### SurveyComponentReportViewModel
Secciones de reporte de componente.
```typescript
{
  id: number;
  surveyData?: ComponentSurveyDataViewmodel;
  component?: ComponentViewModel;
  background?: boolean;
  asset?: boolean;
  abstract?: boolean;
  overall?: boolean;
  dataAnalysis?: boolean;
  summary?: boolean;
}
```

### PaginatedAssetTimestampDataViewModel
Data paginada de timestamps de assets.
```typescript
{
  records?: AssetLatestTimestampDataViewModel[];
  total?: number;
}
```

### AssetTimestampDataFiltersViewModel
Filtros para data de timestamps.
```typescript
{
  description?: string;
  plant?: BaseIdViewModel;
  area?: BaseIdViewModel;
  system?: BaseIdViewModel;
}
```

### AssetTimestampDataRequestViewModel
Petición con filtros y paginación.
```typescript
{
  page?: number;
  pageSize?: number;
  filters?: AssetTimestampDataFiltersViewModel;
}
```

---

## Notas Importantes para el Frontend

### 1. Tipos Nullables
La mayoría de las propiedades son opcionales (`?`) o pueden ser `null`. Siempre valida la existencia de datos antes de usarlos.

### 2. Relaciones
Muchos ViewModels contienen relaciones anidadas. Por ejemplo, `MawoiViewModel` contiene `SystemViewModel`, que contiene `AreaViewModel`, etc. Estas relaciones pueden estar pobladas o no dependiendo del endpoint.

### 3. IDs
- `id: number | null` - Puede ser null al crear nuevos registros
- `id: number` - Siempre tiene valor (típicamente en respuestas)

### 4. Fechas
Las fechas pueden venir como:
- `Date` - Objeto Date de JavaScript
- `string` - String ISO 8601
- Algunos campos tienen versiones formateadas (ej: `measureTimestamp` y `measureFormatTimestamp`)

### 5. Enums y Constantes
Algunos campos tienen valores específicos:
- `frequencyUnits`: `'1' | '2' | '3'`
- `type`: `'START' | 'END'` en `AssetLocationViewModel`
- Siempre revisa los valores permitidos en el backend

### 6. ViewModels de Búsqueda
Los modelos `*SearchViewModel` extienden los modelos base y añaden filtros. Úsalos para peticiones de búsqueda y listados.

### 7. ViewModels de Respuesta
Los modelos en `fault-frequency/*.response.ts` son interfaces simples para respuestas específicas de la API.

### 8. Paginación
Usa `PaginateRequestViewModel<T>` para peticiones paginadas y `PaginateViewModel<T>` para respuestas.

### 9. Genéricos
Algunos ViewModels son genéricos:
- `DataPointViewModel<X, Y>` - Para puntos en gráficas
- `DataSetModel<X, Y>` - Para conjuntos de datos
- `ImageViewModel<E>` - Para imágenes con relación a cualquier entidad

### 10. Herencia
Muchos ViewModels extienden clases base. Por ejemplo, todos los `*SearchViewModel` extienden su modelo base correspondiente.

---

## Endpoints Sugeridos por Entidad

Basándote en los ViewModels, probablemente existan endpoints como:

- `POST /auth/login` - LoginViewModel → LoginResponseViewModel
- `GET /accounts` - → AccountViewModel[]
- `GET /plants` - → PlantViewModel[]
- `GET /areas` - → AreaViewModel[]
- `GET /systems` - → SystemViewModel[]
- `GET /mawois` - → MawoiViewModel[]
- `POST /mawois/search` - MawoiSearchViewModel → PaginateViewModel<MawoiViewModel>
- `GET /points` - → PointViewModel[]
- `GET /bands` - → BandViewModel[]
- `GET /surveys` - → SurveyViewModel[]
- `GET /components` - → ComponentViewModel[]
- `POST /components/survey-data/search` - ComponentSurveyDataSearchViewmodel → PaginateViewModel<ComponentSurveyDataViewmodel>
- `GET /reports/component/:id` - → ComponentReportViewmodel
- `GET /fault-frequency/:pointId` - → FaultFrequencyResponse
- `GET /trends` - TrendsSearchViewModel → TrendsInformationViewModel[]
- `GET /spectra` - SpectraChartViewModel → SpectraInformationViewModel[]

---

## Convenciones de Nomenclatura

1. **ViewModel** - Modelo principal de entidad
2. **SearchViewModel** - Modelo para búsqueda/filtrado
3. **Response** - Interface de respuesta simplificada
4. **PaginateViewmodel** - Vista específica para paginación
5. **Request** - Modelo para peticiones específicas
6. **Information** - Modelo con información consolidada/agregada

---

## Contacto y Soporte

Para dudas sobre ViewModels específicos o propiedades no documentadas, contactar al equipo de backend o revisar los controladores y servicios correspondientes.

**Última actualización**: Noviembre 2025
**Total de ViewModels documentados**: 110+
