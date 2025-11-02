# ViewModels Documentation - Frontend Reference

Esta documentación describe todos los ViewModels disponibles en el backend para su uso en el frontend.

## Índice

- [Autenticación y Usuarios](#autenticación-y-usuarios)
- [Cuentas y Plantas](#cuentas-y-plantas)
- [Áreas y Sistemas](#áreas-y-sistemas)
- [Equipos y Componentes](#equipos-y-componentes)
- [Puntos de Medición](#puntos-de-medición)
- [Alarmas](#alarmas)
- [Bandas y Configuración](#bandas-y-configuración)
- [Frecuencias de Falla](#frecuencias-de-falla)
- [Encuestas y Reportes](#encuestas-y-reportes)
- [Rutas e Instrucciones](#rutas-e-instrucciones)
- [Tribología](#tribología)
- [Datos y Gráficos](#datos-y-gráficos)
- [Utilidades y Paginación](#utilidades-y-paginación)
- [Menús y Vistas](#menús-y-vistas)

---

## Autenticación y Usuarios

### LoginViewModel

**Archivo:** `app/viewmodels/login.viewmodel.ts`

```typescript
{
  email?: string;
  password?: string;
  rememberMe?: boolean;
}
```

### LoginResponseViewModel

**Archivo:** `app/viewmodels/login-response.viewmodel.ts`

```typescript
{
  id: number | null;
  token?: string;
  tokenExpiresAt?: string;
  user?: UserViewModel;
}
```

### UserViewModel

**Archivo:** `app/viewmodels/user.viewmodel.ts`

```typescript
{
  id: number | null;
  name?: string;
  lastName?: string;
  email?: string;
  image?: string;
  active?: boolean;
  phone?: string;
  dni?: string;
  notifyWhatsapp?: boolean;
  notifyEmail?: boolean;
  language?: string;
  plants?: PlantViewModel[];
  account?: AccountViewModel;
  role?: RoleViewModel;
  userTechnologies?: UserTechnologyViewModel[];
}
```

### UserLoginViewModel

**Archivo:** `app/viewmodels/user-login.viewmodel.ts`

```typescript
{
  id: number | null;
  name?: string;
  lastName?: string;
  email?: string;
  password?: string;
  image?: string;
  active?: boolean;
  phone?: string;
  dni?: string;
  notifyWhatsapp?: boolean;
  notifyEmail?: boolean;
  language?: string;
}
```

### UpdatePasswordViewModel

**Archivo:** `app/viewmodels/update-password.viewmodel.ts`

```typescript
{
	currentPassword: string;
	newPassword: string;
}
```

### ValidatePasswordViewModel

**Archivo:** `app/viewmodels/validate-password.viewmodel.ts`

```typescript
{
  password?: string;
}
```

### RoleViewModel

**Archivo:** `app/viewmodels/role.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  permissions?: number[];
}
```

### RoleLoginViewModel

**Archivo:** `app/viewmodels/role-login.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  permissions?: RolePermissionViewModel[];
}
```

### RolePermissionViewModel

**Archivo:** `app/viewmodels/role-permission.viewmodel.ts`

```typescript
{
  id: number;
  label?: string;
  permission?: string;
  checked?: boolean;
}
```

### UserTechnologyViewModel

**Archivo:** `app/viewmodels/user-technology.viewmodel.ts`

```typescript
{
  idUser?: number;
  idComponentType?: number;
  componentType?: ComponentTypeViewModel;
}
```

---

## Cuentas y Plantas

### AccountViewModel

**Archivo:** `app/viewmodels/account.viewmodel.ts`

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

**Archivo:** `app/viewmodels/plant.viewmodel.ts`

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
  account?: AccountViewModel;
  areas?: AreaViewModel[];
  sensorTypes?: SensorTypeViewModel[];
}
```

### PlantLubricantViewModel

**Archivo:** `app/viewmodels/plant-lubricant.viewmodel.ts`

```typescript
{
  id: number | null;
  lubricant?: LubricantViewModel;
  plant?: PlantViewModel;
}
```

### PlantAlarmCodeViewModel

**Archivo:** `app/viewmodels/plant-alarm-code.viewmodel.ts`

```typescript
{
  id: number | null;
  alarmCode?: AlarmCodeViewModel;
  plant?: PlantViewModel;
}
```

### PlantFailureViewModel

**Archivo:** `app/viewmodels/plant-failure.viewmodel.ts`

```typescript
{
  id: number | null;
  plant?: PlantViewModel;
  componentType?: ComponentTypeViewModel;
  failureMode?: ComponentFailureModeViewModel;
}
```

---

## Áreas y Sistemas

### AreaViewModel

**Archivo:** `app/viewmodels/area.viewmodel.ts`

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

### AreaSearchViewModel

**Archivo:** `app/viewmodels/area-search.viewmodel.ts`

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
  account?: AccountViewModel;
  area?: AreaViewModel;
}
```

### SystemViewModel

**Archivo:** `app/viewmodels/system.viewmodel.ts`

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
  area?: AreaViewModel;
  mawois?: MawoiViewModel[];
}
```

### SystemSearchViewModel

**Archivo:** `app/viewmodels/system-search.viewmodel.ts`

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
  area?: AreaViewModel;
  mawois?: MawoiViewModel[];
  account?: AccountViewModel;
  plant?: PlantViewModel;
  system?: SystemViewModel;
}
```

### SystemEventViewModel

**Archivo:** `app/viewmodels/system-event.viewmodel.ts`

```typescript
{
  id: number;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  active?: boolean;
  system?: SystemViewModel;
}
```

---

## Equipos y Componentes

### MawoiViewModel

**Archivo:** `app/viewmodels/mawoi.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  order?: number;
  latitude?: number;
  longitude?: number;
  image?: string;
  rpm?: number;
  system?: SystemViewModel;
  components?: ComponentViewModel[];
}
```

### MawoiSearchViewModel

**Archivo:** `app/viewmodels/mawoi-search.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  order?: number;
  latitude?: number;
  longitude?: number;
  image?: string;
  rpm?: number;
  system?: SystemViewModel;
  components?: ComponentViewModel[];
  account?: AccountViewModel;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  mawoi?: MawoiViewModel;
}
```

### MawoiLocationUpdateViewModel

**Archivo:** `app/viewmodels/mawoi-location-update.viewmodel.ts`

```typescript
{
  latitude?: number;
  longitude?: number;
}
```

### MawoiEventViewModel

**Archivo:** `app/viewmodels/mawoi-event.viewmodel.ts`

```typescript
{
  id: number;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  active?: boolean;
  mawoi?: MawoiViewModel;
}
```

### MawoiFrequencyViewModel

**Archivo:** `app/viewmodels/mawoi-frequency.viewmodel.ts`

```typescript
{
  id: number | null;
  rpm?: number;
  mawoi?: MawoiViewModel;
}
```

### MawoiHierarchyCountsViewModel

**Archivo:** `app/viewmodels/mawoi-hierarchy-counts.viewmodel.ts`

```typescript
{
  id: number;
  code?: string;
  description?: string;
  accounts?: number;
  plants?: number;
  areas?: number;
  systems?: number;
  mawois?: number;
  components?: number;
  points?: number;
}
```

### ComponentViewModel

**Archivo:** `app/viewmodels/component.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  order?: number;
  image?: string;
  mawoi?: MawoiViewModel;
  componentType?: ComponentTypeViewModel;
  componentTechnologies?: ComponentTechnologyViewModel[];
  points?: PointViewModel[];
}
```

### ComponentTypeViewModel

**Archivo:** `app/viewmodels/component-type.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  image?: string;
}
```

### ComponentTechnologyViewModel

**Archivo:** `app/viewmodels/component-technology.viewmodel.ts`

```typescript
{
  id: number | null;
  label?: string;
  description?: string;
  unit?: string;
  component?: ComponentViewModel;
  componentType?: ComponentTypeViewModel;
  componentTechnologyAttachments?: ComponentTechnologyAttachmentViewModel[];
}
```

### ComponentTechnologyAttachmentViewModel

**Archivo:** `app/viewmodels/component-technology-attachment.viewmodel.ts`

```typescript
{
  id: number | null;
  image?: string;
  componentTechnology?: ComponentTechnologyViewModel;
}
```

### ComponentFailureGroupViewModel

**Archivo:** `app/viewmodels/component-failure-group.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  description?: string;
}
```

### ComponentFailureModeViewModel

**Archivo:** `app/viewmodels/component-failure-mode.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  failureGroup?: ComponentFailureGroupViewModel;
}
```

---

## Puntos de Medición

### PointViewModel

**Archivo:** `app/viewmodels/point.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  order?: number;
  component?: ComponentViewModel;
  sensorType?: SensorTypeViewModel;
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
  bandSet?: BandSetViewModel;
}
```

### PointSearchViewModel

**Archivo:** `app/viewmodels/point-search.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  order?: number;
  component?: ComponentViewModel;
  sensorType?: SensorTypeViewModel;
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
  bandSet?: BandSetViewModel;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  system?: SystemViewModel;
  mawoi?: MawoiViewModel;
  point?: PointViewModel;
}
```

### PointOfflineViewModel

**Archivo:** `app/viewmodels/point-offline.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  order?: number;
  component?: ComponentViewModel;
  sensorType?: SensorTypeViewModel;
  goodThreshold?: number;
  warningThreshold?: number;
  errorThreshold?: number;
  accGoodThreshold?: number;
  accWarningThreshold?: number;
  accErrorThreshold?: number;
  tempGoodThreshold?: number;
  tempWarningThreshold?: number;
  tempErrorThreshold?: number;
  pkpkGoodThreshold?: number;
  pkpkWarningThreshold?: number;
  pkpkErrorThreshold?: number;
  bandSet?: BandSetViewModel;
}
```

### PointBandSetQueryResult

**Archivo:** `app/viewmodels/point-band-set-query-result.ts`

```typescript
{
  codePoint?: string;
  descriptionPoint?: string;
  idBandSet?: number;
  codeBandSet?: string;
  codePlantSet?: string;
}
```

### SensorTypeViewModel

**Archivo:** `app/viewmodels/sensor-type.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  description?: string;
}
```

---

## Alarmas

### AlarmCodeViewModel

**Archivo:** `app/viewmodels/alarm-code.viewmodel.ts`

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

### AlarmCustomSurveyResponseViewModel

**Archivo:** `app/viewmodels/alarm-custom-survey-response.viewmodel.ts`

```typescript
{
  mawois: AlarmCustomSurveyMawoiViewModel[];
}

// AlarmCustomSurveyMawoiViewModel
{
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

// AlarmCustomSurveyPointViewModel
{
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

### TypicalInformationAlarmViewModel

**Archivo:** `app/viewmodels/typical-information-alarm.viewmodel.ts`

```typescript
{
  id?: number;
  code?: string;
  description?: string;
  lastUpdate?: Date;
  lastAlarmCode?: string;
  lastAlarmDescription?: string;
  lastAlarmColor?: string;
}
```

### TypicalPointAlarmViewModel

**Archivo:** `app/viewmodels/typical-point-alarm.viewmodel.ts`

```typescript
{
  timestamp?: Date;
  alarmCode?: string;
  alarmDescription?: string;
  alarmColor?: string;
  overall?: number;
  overallAcc?: number;
  temperature?: number;
  pkPk?: number;
}
```

### TypicalMawoiAlarmViewModel

**Archivo:** `app/viewmodels/typical-mawoi-alarm.viewmodel.ts`

```typescript
{
  alarmCode?: string;
  alarmDescription?: string;
  alarmColor?: string;
  lastUpdate?: Date;
  overallVel?: number;
  overallAcc?: number;
  temperature?: number;
  pkPk?: number;
}
```

---

## Bandas y Configuración

### BandViewModel

**Archivo:** `app/viewmodels/band.viewmodel.ts`

```typescript
{
  id: number | null;
  lowerLimit?: number;
  upperLimit?: number;
  unit?: string;
  order?: number;
  alarmCode?: AlarmCodeViewModel;
  bandSet?: BandSetViewModel;
}
```

### BandSetViewModel

**Archivo:** `app/viewmodels/band-set.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  bands?: BandViewModel[];
  bandPlantSets?: BandPlantSetViewModel[];
}
```

### BandPlantSetViewModel

**Archivo:** `app/viewmodels/band-plant-set.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  plant?: PlantViewModel;
  bandSet?: BandSetViewModel;
}
```

### BandPlantSetDefinitionViewModel

**Archivo:** `app/viewmodels/band-plant-set-definition.viewmodel.ts`

```typescript
{
  id: number | null;
  lowerLimit?: number;
  upperLimit?: number;
  unit?: string;
  order?: number;
  alarmCode?: AlarmCodeViewModel;
  bandPlantSet?: BandPlantSetViewModel;
}
```

### BandSearchViewModel

**Archivo:** `app/viewmodels/band-search.viewmodel.ts`

```typescript
{
  id: number | null;
  lowerLimit?: number;
  upperLimit?: number;
  unit?: string;
  order?: number;
  alarmCode?: AlarmCodeViewModel;
  bandSet?: BandSetViewModel;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  band?: BandViewModel;
}
```

### BandInformationViewModel

**Archivo:** `app/viewmodels/band-information.viewmodel.ts`

```typescript
{
  value?: number;
  alarmCode?: string;
  alarmDescription?: string;
  color?: string;
}
```

### BandCommentViewModel

**Archivo:** `app/viewmodels/band-comment.viewmodel.ts`

```typescript
{
	bandComment: string;
}
```

### BandAlarmValueViewModel

**Archivo:** `app/viewmodels/band-alarm-value.viewmodel.ts`

```typescript
{
  velocity?: BandInformationViewModel;
  acceleration?: BandInformationViewModel;
  temperature?: BandInformationViewModel;
  pkPk?: BandInformationViewModel;
}
```

---

## Frecuencias de Falla

### FaultFrequencyResponse

**Archivo:** `app/viewmodels/fault-frequency/fault-frequency.response.ts`

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

### SynchronouResponse

**Archivo:** `app/viewmodels/fault-frequency/synchronou.response.ts`

```typescript
{
  label?: string;
  firstHarmonic?: number;
  lastHarmonic?: number;
}
```

### BladeResponse

**Archivo:** `app/viewmodels/fault-frequency/blade.response.ts`

```typescript
{
  label?: string;
  numberOfBlades?: number;
  lastHarmonic?: number;
}
```

### BearingResponse

**Archivo:** `app/viewmodels/fault-frequency/bearing.response.ts`

```typescript
{
  label?: string;
  ftf?: number;
  bsf?: number;
  bpfo?: number;
  bpfi?: number;
  lastHarmonic?: number;
}
```

### GearboxResponse

**Archivo:** `app/viewmodels/fault-frequency/gearbox.response.ts`

```typescript
{
  label?: string;
  z1?: number;
  z2?: number;
  z3?: number;
  z4?: number;
  z5?: number;
  z6?: number;
  lastHarmonic?: number;
}
```

### BeltResponse

**Archivo:** `app/viewmodels/fault-frequency/belt.response.ts`

```typescript
{
  label?: string;
  frequency?: number;
  lastHarmonic?: number;
}
```

### ChainResponse

**Archivo:** `app/viewmodels/fault-frequency/chain.response.ts`

```typescript
{
  label?: string;
  frequency?: number;
  lastHarmonic?: number;
}
```

### FixedFrequencyResponse

**Archivo:** `app/viewmodels/fault-frequency/fixed-frequency.response.ts`

```typescript
{
  label?: string;
  freq1?: number;
  freq2?: number;
  freq3?: number;
  lastHarmonic?: number;
}
```

### Modelos de Configuración

#### SynchronouViewModel

**Archivo:** `app/viewmodels/synchronou.viewmodel.ts`

```typescript
{
  id: number | null;
  label?: string;
  firstHarmonic?: number;
  lastHarmonic?: number;
  component?: ComponentViewModel;
}
```

#### BladeViewModel

**Archivo:** `app/viewmodels/blade.viewmodel.ts`

```typescript
{
  id: number | null;
  label?: string;
  numberOfBlades?: number;
  lastHarmonic?: number;
  component?: ComponentViewModel;
}
```

#### BearingViewModel

**Archivo:** `app/viewmodels/bearing.viewmodel.ts`

```typescript
{
  id: number | null;
  label?: string;
  bearingDimension?: BearingDimensionViewModel;
  ftf?: number;
  bsf?: number;
  bpfo?: number;
  bpfi?: number;
  lastHarmonic?: number;
  component?: ComponentViewModel;
}
```

#### BearingDimensionViewModel

**Archivo:** `app/viewmodels/bearingdimension.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  outsideDiameter?: number;
  pitchDiameter?: number;
  insideDiameter?: number;
  rollerBallDiameter?: number;
  numberOfRollingElements?: number;
  contactAngle?: number;
}
```

#### GearboxViewModel

**Archivo:** `app/viewmodels/gearbox.viewmodel.ts`

```typescript
{
  id: number | null;
  label?: string;
  z1?: number;
  z2?: number;
  z3?: number;
  z4?: number;
  z5?: number;
  z6?: number;
  lastHarmonic?: number;
  component?: ComponentViewModel;
}
```

#### BeltViewModel

**Archivo:** `app/viewmodels/belt.viewmodel.ts`

```typescript
{
  id: number | null;
  label?: string;
  frequency?: number;
  lastHarmonic?: number;
  component?: ComponentViewModel;
}
```

#### ChainViewModel

**Archivo:** `app/viewmodels/chain.viewmodel.ts`

```typescript
{
  id: number | null;
  label?: string;
  frequency?: number;
  lastHarmonic?: number;
  component?: ComponentViewModel;
}
```

#### FixedFrequencyViewModel

**Archivo:** `app/viewmodels/fixed-frequency-view.model.ts`

```typescript
{
  id: number | null;
  label?: string;
  freq1?: number;
  freq2?: number;
  freq3?: number;
  lastHarmonic?: number;
  component?: ComponentViewModel;
}
```

---

## Encuestas y Reportes

### SurveyViewModel

**Archivo:** `app/viewmodels/survey.viewmodel.ts`

```typescript
{
  id: number | null;
  date?: Date;
  collector?: UserViewModel;
  analyst?: UserViewModel;
  approved?: boolean;
  approvedDate?: Date;
  plant?: PlantViewModel;
  route?: RouteViewModel;
  componentSurveys?: ComponentSurveyDataViewmodel[];
}
```

### SurveySearchViewModel

**Archivo:** `app/viewmodels/survey-search.viewmodel.ts`

```typescript
{
  id: number | null;
  date?: Date;
  collector?: UserViewModel;
  analyst?: UserViewModel;
  approved?: boolean;
  approvedDate?: Date;
  plant?: PlantViewModel;
  route?: RouteViewModel;
  componentSurveys?: ComponentSurveyDataViewmodel[];
  account?: AccountViewModel;
  survey?: SurveyViewModel;
}
```

### SurveyFilterViewModel

**Archivo:** `app/viewmodels/survey-filter.viewmodel.ts`

```typescript
{
  idAccount?: number;
  idPlant?: number;
  idRoute?: number;
  idAnalyst?: number;
  from?: Date;
  to?: Date;
}
```

### ComponentSurveyDataViewmodel

**Archivo:** `app/viewmodels/component-survey-data.viewmodel.ts`

```typescript
{
  id: number | null;
  survey?: SurveyViewModel;
  component?: ComponentViewModel;
  componentReport?: ComponentReportViewModel;
  failureMode?: ComponentFailureModeViewModel;
  alarmCode?: AlarmCodeViewModel;
  date?: Date;
}
```

### ComponentSurveyDataSearchViewModel

**Archivo:** `app/viewmodels/component-survey-data-search.viewmodel.ts`

```typescript
{
  id: number | null;
  survey?: SurveyViewModel;
  component?: ComponentViewModel;
  componentReport?: ComponentReportViewModel;
  failureMode?: ComponentFailureModeViewModel;
  alarmCode?: AlarmCodeViewModel;
  date?: Date;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  system?: SystemViewModel;
  mawoi?: MawoiViewModel;
  componentSurveyData?: ComponentSurveyDataViewmodel;
}
```

### ComponentReportViewModel

**Archivo:** `app/viewmodels/component-report.viewmodel.ts`

```typescript
{
  id: number | null;
  recommendation?: string;
  note?: string;
  componentReportAttachments?: ComponentReportAttachmentViewModel[];
  componentReportAlignments?: ComponentReportAlignmentViewModel[];
  componentReportBalancings?: ComponentReportBalancingViewModel[];
  componentReportDataAnalysis?: ComponentReportDataAnalysisViewModel[];
}
```

### ComponentReportAttachmentViewModel

**Archivo:** `app/viewmodels/component-report-attachment.viewmodel.ts`

```typescript
{
  id: number | null;
  image?: string;
  description?: string;
  order?: number;
}
```

### ComponentReportAlignmentViewModel

**Archivo:** `app/viewmodels/component-report-alignment.viewmodel.ts`

```typescript
{
  id: number | null;
  vertical?: number;
  horizontal?: number;
  foot?: string;
  label?: string;
  componentReport?: ComponentReportViewModel;
}
```

### ComponentReportBalancingViewModel

**Archivo:** `app/viewmodels/component-report-balancing.viewmodel.ts`

```typescript
{
  id: number | null;
  weight?: number;
  angle?: number;
  plane?: string;
  label?: string;
  componentReport?: ComponentReportViewModel;
}
```

### ComponentReportDataAnalysisViewModel

**Archivo:** `app/viewmodels/component-report-data-analysis.viewmodel.ts`

```typescript
{
  id: number | null;
  value?: number;
  label?: string;
  unit?: string;
  componentReport?: ComponentReportViewModel;
}
```

### SurveyComponentReportViewModel

**Archivo:** `app/viewmodels/survey-component-report.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  componentTypeName?: string;
  systemName?: string;
  recommendation?: string;
  note?: string;
  failureModeDescription?: string;
  alarmCodeDescription?: string;
  alarmCodeColor?: string;
  date?: Date;
  attachments?: ComponentReportAttachmentViewModel[];
  alignments?: ComponentReportAlignmentViewModel[];
  balancings?: ComponentReportBalancingViewModel[];
  dataAnalysis?: ComponentReportDataAnalysisViewModel[];
}
```

### SurveyDataReportViewModel

**Archivo:** `app/viewmodels/survey-data-report.viewmodel.ts`

```typescript
{
  date?: Date;
  collectorName?: string;
  analystName?: string;
  approved?: boolean;
  approvedDate?: Date;
  routeName?: string;
  surveyComponents?: SurveyComponentReportViewModel[];
}
```

---

## Rutas e Instrucciones

### RouteViewModel

**Archivo:** `app/viewmodels/route.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  plant?: PlantViewModel;
  instructions?: RouteInstructionViewModel[];
}
```

### RouteSearchViewModel

**Archivo:** `app/viewmodels/route-search.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  plant?: PlantViewModel;
  instructions?: RouteInstructionViewModel[];
  account?: AccountViewModel;
  route?: RouteViewModel;
}
```

### RouteInstructionViewModel

**Archivo:** `app/viewmodels/route-instruction.viewmodel.ts`

```typescript
{
  id: number | null;
  order?: number;
  latitude?: number;
  longitude?: number;
  route?: RouteViewModel;
  component?: ComponentViewModel;
}
```

### RouteInstructionSearchViewModel

**Archivo:** `app/viewmodels/route-instruction-search.viewmodel.ts`

```typescript
{
  id: number | null;
  order?: number;
  latitude?: number;
  longitude?: number;
  route?: RouteViewModel;
  component?: ComponentViewModel;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  system?: SystemViewModel;
  mawoi?: MawoiViewModel;
  routeInstruction?: RouteInstructionViewModel;
}
```

### RouteInstructionPaginateViewModel

**Archivo:** `app/viewmodels/route-instruction-paginate.viewmodel.ts`

```typescript
{
  id: number | null;
  order?: number;
  latitude?: number;
  longitude?: number;
  route?: RouteViewModel;
  component?: any;
}
```

---

## Tribología

### LubricantViewModel

**Archivo:** `app/viewmodels/lubricant.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  description?: string;
}
```

### AnalysisDataTribologyViewmodel

**Archivo:** `app/viewmodels/analysis-data-tribology.viewmodel.ts`

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
  mg?: number;
  cd?: number;
  mn?: number;
  ca?: number;
  ba?: number;
  p?: number;
  zn?: number;
  si?: number;
  na?: number;
  k?: number;
  b?: number;
  fe?: number;
  cr?: number;
  mo?: number;
  al?: number;
  cu?: number;
  pb?: number;
  sn?: number;
  ag?: number;
  ni?: number;
  v?: number;
  ti?: number;
  wplarge?: number;
  wpsmall?: number;
  wpcount?: number;
  iso4um?: number;
  iso6um?: number;
  iso10um?: number;
  iso14um?: number;
  iso21um?: number;
  iso40um?: number;
  pcount4um?: number;
  pcount6um?: number;
  pcount10um?: number;
  pcount14um?: number;
  pcount21um?: number;
  pcount40um?: number;
  surveyDataDate?: string;
  isBase?: boolean;
  lubricantId?: number;
}
```

### TribologyRequestViewmodel

**Archivo:** `app/viewmodels/analysis-data-tribology.viewmodel.ts`

```typescript
{
  componentSurvey?: ComponentSurveyDataViewmodel;
  surveyDataDate?: string;
  isBase?: boolean;
  lubricantId?: number;
}
```

### TribologyViewModel

**Archivo:** `app/viewmodels/reports/tribology.viewmodel.ts`

Contiene todos los campos de `AnalysisDataTribologyViewmodel` más campos adicionales con sufijo `Class` para clasificación de valores (ej: `viscosity40Class`, `viscosity100Class`, etc.).

### AnalysisDataTribologyPaginateViewmodel

**Archivo:** `app/viewmodels/analysis-data-tribology-paginate.viewmodel.ts`

```typescript
{
  id: number | null;
  alarmCode?: any;
  component?: any;
  failureMode?: any;
  date?: Date;
}
```

---

## Datos y Gráficos

### DataPointViewModel

**Archivo:** `app/viewmodels/data-point.viewmodel.ts`

```typescript
{
  timestamp?: Date;
  overall?: number;
  overallAcc?: number;
  temperature?: number;
  pkPk?: number;
  alarmCode?: string;
  alarmColor?: string;
}
```

### DatasetViewModel

**Archivo:** `app/viewmodels/dataset.viewmodel.ts`

```typescript
{
  label?: string;
  data?: DataPointViewModel[];
}
```

### SpectraChartViewModel

**Archivo:** `app/viewmodels/spectra-chart.viewmodel.ts`

```typescript
{
  singleData?: number[];
  doubleData?: number[][];
}
```

### SpectraInformationViewModel

**Archivo:** `app/viewmodels/spectra-information.viewmodel.ts`

```typescript
{
  rpm?: number;
  fmax?: number;
  linesOfResolution?: number;
  type?: string;
}
```

### TrendsInformationViewModel

**Archivo:** `app/viewmodels/trends-information.viewmodel.ts`

```typescript
{
  pointInformation?: TypicalInformationViewModel;
  overall?: DatasetViewModel;
  overallAcc?: DatasetViewModel;
  temperature?: DatasetViewModel;
  pkPk?: DatasetViewModel;
}
```

### TrendsSearchViewModel

**Archivo:** `app/viewmodels/trends-search.viewmodel.ts`

```typescript
{
  account?: AccountViewModel;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  system?: SystemViewModel;
  mawoi?: MawoiViewModel;
  component?: ComponentViewModel;
  point?: PointViewModel;
  from?: Date;
  to?: Date;
}
```

### HistoryOverallsViewModel

**Archivo:** `app/viewmodels/history-overalls.viewmodel.ts`

```typescript
{
  timestamp?: Date;
  overall?: number;
  overallAcc?: number;
  temperature?: number;
  pkPk?: number;
}
```

### LatestTimestampDataViewModel

**Archivo:** `app/viewmodels/latest-timestamp-data.viewmodel.ts`

```typescript
{
  timestamp?: Date;
}
```

### AssetLatestTimestampDataViewModel

**Archivo:** `app/viewmodels/asset-latest-timestamp-data.viewmodel.ts`

```typescript
{
  account?: string;
  plant?: string;
  area?: string;
  system?: string;
  mawoi?: string;
  component?: string;
  point?: string;
  timestamp?: Date;
}
```

### PaginatedAssetTimestampDataViewModel

**Archivo:** `app/viewmodels/paginated-asset-timestamp-data.viewmodel.ts`

```typescript
{
  rows?: AssetLatestTimestampDataViewModel[];
  page?: number;
  size?: number;
  total?: number;
}
```

### CollectDataExecutionViewModel

**Archivo:** `app/viewmodels/collect-data-execution.viewmodel.ts`

```typescript
{
  pointId?: number;
  timestamp?: Date;
}
```

### CollectDataFromToExecutionViewModel

**Archivo:** `app/viewmodels/collect-data-from-to-execution.viewmodel.ts`

```typescript
{
  pointId?: number;
  from?: Date;
  to?: Date;
}
```

---

## Utilidades y Paginación

### PaginateViewModel

**Archivo:** `app/viewmodels/paginate.viewmodel.ts`

```typescript
{
  rows?: any[];
  page?: number;
  size?: number;
  total?: number;
}
```

### PaginateRequestViewModel

**Archivo:** `app/viewmodels/paginate-request.viewmodel.ts`

```typescript
{
  page?: number;
  size?: number;
  search?: string;
  orderBy?: string;
  orderDirection?: string;
}
```

### BaseIdViewModel

**Archivo:** `app/viewmodels/base-id.viewmodel.ts`

```typescript
{
	id: number | null;
}
```

### DateSearchViewModel

**Archivo:** `app/viewmodels/date-search.viewmodel.ts`

```typescript
{
  from?: Date;
  to?: Date;
}
```

### EventSearchViewModel

**Archivo:** `app/viewmodels/event-search.viewmodel.ts`

```typescript
{
  from?: Date;
  to?: Date;
  idAccount?: number;
  idPlant?: number;
  idArea?: number;
  idSystem?: number;
  idMawoi?: number;
}
```

### EventExclusionViewModel

**Archivo:** `app/viewmodels/event-exclusion.viewmodel.ts`

```typescript
{
  from?: Date;
  to?: Date;
  timestamp?: Date[];
}
```

---

## Reportes de Usuario

### UserFilterViewModel

**Archivo:** `app/viewmodels/user-filter.viewmodel.ts`

```typescript
{
  idAccount?: number;
  idPlant?: number;
  idUser?: number;
  from?: Date;
  to?: Date;
}
```

### UserBriefReportViewModel

**Archivo:** `app/viewmodels/user-brief-report.viewmodel.ts`

```typescript
{
  userName?: string;
  date?: Date;
  totalComponents?: number;
}
```

### UserDetailedReportViewModel

**Archivo:** `app/viewmodels/user-detailed-report.viewmodel.ts`

```typescript
{
  userName?: string;
  date?: Date;
  system?: string;
  mawoi?: string;
  component?: string;
  componentType?: string;
  failureMode?: string;
  alarmCode?: string;
  alarmColor?: string;
}
```

### UserComponentReportViewModel

**Archivo:** `app/viewmodels/user-component-report.viewmodel.ts`

```typescript
{
  userName?: string;
  componentType?: string;
  date?: Date;
  totalComponents?: number;
}
```

### UserReliabilityChartViewModel

**Archivo:** `app/viewmodels/user-reliability-chart.viewmodel.ts`

```typescript
{
  userName?: string;
  date?: Date;
  totalGood?: number;
  totalWarning?: number;
  totalDanger?: number;
}
```

---

## Confiabilidad

### AssetReliabilitySurveyViewModel

**Archivo:** `app/viewmodels/asset-reliability-survey.viewmodel.ts`

```typescript
{
  surveyId?: number;
  date?: Date;
  areaCode?: string;
  areaDescription?: string;
  systemCode?: string;
  systemDescription?: string;
  mawoiCode?: string;
  mawoiDescription?: string;
  componentCode?: string;
  componentDescription?: string;
  alarmCode?: string;
  alarmDescription?: string;
  alarmColor?: string;
}
```

### AssetReliabilityReportViewModel

**Archivo:** `app/viewmodels/asset-reliability-report.viewmodel.ts`

```typescript
{
  plantId?: number;
  plantCode?: string;
  plantDescription?: string;
  areaId?: number;
  areaCode?: string;
  areaDescription?: string;
  systemId?: number;
  systemCode?: string;
  systemDescription?: string;
  mawoiId?: number;
  mawoiCode?: string;
  mawoiDescription?: string;
  componentId?: number;
  componentCode?: string;
  componentDescription?: string;
  alarmCode?: string;
  alarmDescription?: string;
  alarmColor?: string;
  lastUpdate?: Date;
}
```

### ReliabilityFailuresViewModel

**Archivo:** `app/viewmodels/reliability-failures.viewmodel.ts`

```typescript
{
  failureModeDescription?: string;
  totalComponents?: number;
}
```

---

## Menús y Vistas

### MenuViewModel

**Archivo:** `app/viewmodels/menu.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  description?: string;
  order?: number;
  image?: string;
  plant?: PlantViewModel;
  vistas?: VistasViewModel[];
}
```

### MenuManagementViewModel

**Archivo:** `app/viewmodels/menu-management.viewmodel.ts`

```typescript
{
  id?: number;
  code?: string;
  description?: string;
  order?: number;
  image?: string;
  vistas?: VistasViewModel[];
}
```

### VistasViewModel

**Archivo:** `app/viewmodels/vistas.viewmodel.ts`

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

### VistasSearchViewModel

**Archivo:** `app/viewmodels/vistas-search.viewmodel.ts`

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
  account?: AccountViewModel;
  vistas?: VistasViewModel;
}
```

### VistasContentViewModel

**Archivo:** `app/viewmodels/vistascontent.viewmodel.ts`

```typescript
{
  id: number | null;
  order?: number;
  vistas?: VistasViewModel;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  system?: SystemViewModel;
  mawoi?: MawoiViewModel;
  component?: ComponentViewModel;
  point?: PointViewModel;
}
```

---

## Información Típica

### TypicalInformationViewModel

**Archivo:** `app/viewmodels/typical-information.viewmodel.ts`

```typescript
{
  id?: number;
  code?: string;
  description?: string;
  lastUpdate?: Date;
  lastOverall?: number;
  lastOverallAcc?: number;
  lastTemperature?: number;
  lastPkPk?: number;
  lastAlarmCode?: string;
  lastAlarmDescription?: string;
  lastAlarmColor?: string;
}
```

### TypicalInformationPointViewModel

**Archivo:** `app/viewmodels/typical-information-point.viewmodel.ts`

```typescript
{
  point?: PointViewModel;
  lastUpdate?: Date;
  lastOverall?: number;
  lastOverallAcc?: number;
  lastTemperature?: number;
  lastPkPk?: number;
  lastAlarmCode?: string;
  lastAlarmDescription?: string;
  lastAlarmColor?: string;
}
```

### TypicalPointViewModel

**Archivo:** `app/viewmodels/typicalpoint.viewmodel.ts`

```typescript
{
  id: number | null;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  system?: SystemViewModel;
  mawoi?: MawoiViewModel;
  component?: ComponentViewModel;
  point?: PointViewModel;
}
```

### TypicalPointSearchViewModel

**Archivo:** `app/viewmodels/typicalpoint-search.viewmodel.ts`

```typescript
{
  id: number | null;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  system?: SystemViewModel;
  mawoi?: MawoiViewModel;
  component?: ComponentViewModel;
  point?: PointViewModel;
  typicalPoint?: TypicalPointViewModel;
}
```

### TypicalMawoiViewModel

**Archivo:** `app/viewmodels/typicalmawoi.viewmodel.ts`

```typescript
{
  id: number | null;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  system?: SystemViewModel;
  mawoi?: MawoiViewModel;
}
```

### TypicalMawoiSearchViewModel

**Archivo:** `app/viewmodels/typicalmawoi-search.viewmodel.ts`

```typescript
{
  id: number | null;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  system?: SystemViewModel;
  mawoi?: MawoiViewModel;
  typicalMawoi?: TypicalMawoiViewModel;
}
```

### TypicalBandViewModel

**Archivo:** `app/viewmodels/typicalband.viewmodel.ts`

```typescript
{
  id: number | null;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  band?: BandViewModel;
}
```

### TypicalBandSearchViewModel

**Archivo:** `app/viewmodels/typicalband-search.viewmodel.ts`

```typescript
{
  id: number | null;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  band?: BandViewModel;
  typicalBand?: TypicalBandViewModel;
}
```

### TypicalQueryResult

**Archivo:** `app/viewmodels/typical-query-result.ts`

```typescript
{
  id?: number;
  idAccount?: number;
  idPlant?: number;
  idArea?: number;
  idSystem?: number;
  idMawoi?: number;
  idComponent?: number;
  idPoint?: number;
}
```

---

## Imágenes y Archivos

### ImageViewModel

**Archivo:** `app/viewmodels/image.viewmodel.ts`

```typescript
{
  image?: string;
}
```

### UpdateImageViewModel

**Archivo:** `app/viewmodels/update-image.viewmodel.ts`

```typescript
{
  image?: string;
}
```

### FileViewModel

**Archivo:** `app/viewmodels/file.viewmodel.ts`

```typescript
{
  file?: string;
}
```

---

## Comunicación

### MessageViewModel

**Archivo:** `app/viewmodels/message.viewmodel.ts`

```typescript
{
  id?: number;
  text?: string;
  userId?: number;
  conversationId?: number;
  createdAt?: Date;
}
```

### ConversationViewModel

**Archivo:** `app/viewmodels/conversation.viewmodel.ts`

```typescript
{
  id?: number;
  participants?: ParticipantViewModel[];
  messages?: MessageViewModel[];
  createdAt?: Date;
  updatedAt?: Date;
}
```

### ParticipantViewModel

**Archivo:** `app/viewmodels/participant.viewmodel.ts`

```typescript
{
  userId?: number;
  conversationId?: number;
  joinedAt?: Date;
}
```

### NotificationViewModel

**Archivo:** `app/viewmodels/notification.viewmodel.ts`

```typescript
{
  id?: number;
  userId?: number;
  type?: string;
  message?: string;
  isRead?: boolean;
  createdAt?: Date;
}
```

### SMSUserViewModel

**Archivo:** `app/viewmodels/sms-user.viewmodel.ts`

```typescript
{
  id?: number;
  user?: UserViewModel;
  smsTemplate?: string;
  phone?: string;
  createdAt?: Date;
}
```

---

## Contacto

### ContactRequestViewModel

**Archivo:** `app/viewmodels/contactrequest.viewmodel.ts`

```typescript
{
  id: number | null;
  name?: string;
  email?: string;
  telephone?: string;
  message?: string;
  createdAt?: Date;
}
```

### ContactRequestSearchViewModel

**Archivo:** `app/viewmodels/contactrequest-search.viewmodel.ts`

```typescript
{
  id: number | null;
  name?: string;
  email?: string;
  telephone?: string;
  message?: string;
  createdAt?: Date;
  contactRequest?: ContactRequestViewModel;
}
```

---

## Configuración de Firmware

### ConfigFirmwareViewModel

**Archivo:** `app/viewmodels/config-firmware.viewmodel.ts`

```typescript
{
  id: number | null;
  version?: string;
  url?: string;
  active?: boolean;
  createdAt?: Date;
}
```

---

## Tracking

### TrackerViewModel

**Archivo:** `app/viewmodels/tracker.viewmodel.ts`

```typescript
{
  id?: number;
  entity?: string;
  action?: string;
  userId?: number;
  userName?: string;
  data?: any;
  createdAt?: Date;
}
```

---

## Ubicación de Activos

### AssetLocationViewModel

**Archivo:** `app/viewmodels/asset-location.viewmodel.ts`

```typescript
{
  latitude?: number;
  longitude?: number;
  zoom?: number;
}
```

---

## Búsquedas de Frecuencias de Falla

### FaultFreqSearchViewModel

**Archivo:** `app/viewmodels/faultfreq-search.viewmodel.ts`

```typescript
{
  account?: AccountViewModel;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  system?: SystemViewModel;
  mawoi?: MawoiViewModel;
  component?: ComponentViewModel;
}
```

### BearingDimensionSearchViewModel

**Archivo:** `app/viewmodels/bearingdimension-search.viewmodel.ts`

```typescript
{
  id: number | null;
  code?: string;
  outsideDiameter?: number;
  pitchDiameter?: number;
  insideDiameter?: number;
  rollerBallDiameter?: number;
  numberOfRollingElements?: number;
  contactAngle?: number;
  bearingDimension?: BearingDimensionViewModel;
}
```

### BearingSearchViewModel

**Archivo:** `app/viewmodels/bearing-search.viewmodel.ts`

```typescript
{
  id: number | null;
  label?: string;
  bearingDimension?: BearingDimensionViewModel;
  ftf?: number;
  bsf?: number;
  bpfo?: number;
  bpfi?: number;
  lastHarmonic?: number;
  component?: ComponentViewModel;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  system?: SystemViewModel;
  mawoi?: MawoiViewModel;
  bearing?: BearingViewModel;
}
```

### BladeSearchViewModel

**Archivo:** `app/viewmodels/blade-search.viewmodel.ts`

```typescript
{
  id: number | null;
  label?: string;
  numberOfBlades?: number;
  lastHarmonic?: number;
  component?: ComponentViewModel;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  system?: SystemViewModel;
  mawoi?: MawoiViewModel;
  blade?: BladeViewModel;
}
```

### BeltSearchViewModel

**Archivo:** `app/viewmodels/belt-search.viewmodel.ts`

```typescript
{
  id: number | null;
  label?: string;
  frequency?: number;
  lastHarmonic?: number;
  component?: ComponentViewModel;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  system?: SystemViewModel;
  mawoi?: MawoiViewModel;
  belt?: BeltViewModel;
}
```

### ChainSearchViewModel

**Archivo:** `app/viewmodels/chain-search.viewmodel.ts`

```typescript
{
  id: number | null;
  label?: string;
  frequency?: number;
  lastHarmonic?: number;
  component?: ComponentViewModel;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  system?: SystemViewModel;
  mawoi?: MawoiViewModel;
  chain?: ChainViewModel;
}
```

### FixedFreqSearchViewModel

**Archivo:** `app/viewmodels/fixedfreq-search.viewmodel.ts`

```typescript
{
  id: number | null;
  label?: string;
  freq1?: number;
  freq2?: number;
  freq3?: number;
  lastHarmonic?: number;
  component?: ComponentViewModel;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  system?: SystemViewModel;
  mawoi?: MawoiViewModel;
}
```

### GearboxSearchViewModel

**Archivo:** `app/viewmodels/gearbox-search.viewmodel.ts`

```typescript
{
  id: number | null;
  label?: string;
  z1?: number;
  z2?: number;
  z3?: number;
  z4?: number;
  z5?: number;
  z6?: number;
  lastHarmonic?: number;
  component?: ComponentViewModel;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  system?: SystemViewModel;
  mawoi?: MawoiViewModel;
  gearbox?: GearboxViewModel;
}
```

### SynchronouSearchViewModel

**Archivo:** `app/viewmodels/synchronou-search.viewmodel.ts`

```typescript
{
  id: number | null;
  label?: string;
  firstHarmonic?: number;
  lastHarmonic?: number;
  component?: ComponentViewModel;
  account?: AccountViewModel;
  plant?: PlantViewModel;
  area?: AreaViewModel;
  system?: SystemViewModel;
  mawoi?: MawoiViewModel;
  synchronou?: SynchronouViewModel;
}
```

---

## Notas de Uso

### Convenciones Generales

1. **IDs Nulos**: La mayoría de los ViewModels aceptan `id: number | null`, donde `null` indica un objeto nuevo.

2. **Relaciones**: Los ViewModels mantienen relaciones entre entidades (ej: `plant` contiene `areas`, `area` contiene `systems`, etc.).

3. **Búsquedas**: Los ViewModels con sufijo `SearchViewModel` extienden el modelo base e incluyen campos adicionales para filtrado jerárquico.

4. **Paginación**: Use `PaginateRequestViewModel` para solicitudes paginadas y espere `PaginateViewModel` como respuesta.

5. **Fechas**: Las fechas se manejan como objetos `Date` en TypeScript.

6. **Thresholds**: Los umbrales (good/warning/error) pueden ser `null` si no están configurados.

7. **Imágenes**: Los campos `image` contienen URLs o datos base64 de imágenes.

### Jerarquía de Activos

```
Account (Cuenta)
  └── Plant (Planta)
      └── Area (Área)
          └── System (Sistema)
              └── Mawoi (Equipo)
                  └── Component (Componente)
                      └── Point (Punto de Medición)
```

### Tipos de Alarma

Las alarmas se clasifican por colores:

- **Verde/Good**: Estado normal
- **Amarillo/Warning**: Advertencia
- **Rojo/Error/Danger**: Error crítico

### Tecnologías de Componentes

Los componentes pueden tener diferentes tecnologías de monitoreo:

- Vibración (Velocity, Acceleration)
- Temperatura
- Tribología (Análisis de aceite)

---

## Métodos Estáticos Útiles

Algunos ViewModels incluyen métodos estáticos para crear instancias por defecto:

```typescript
AccountViewModel.defaultAccountViewModel();
```

Estos métodos facilitan la creación de objetos con valores por defecto.

---

**Última actualización:** Octubre 2025
**Versión del Backend:** Compatible con la estructura actual del proyecto
