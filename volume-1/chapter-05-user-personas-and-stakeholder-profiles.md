# ClimateX Enterprise Blueprint

## Volume 1 — Foundation & System Architecture

### Chapter 5: User Personas & Stakeholder Profiles

---

| Document Control | |
|---|---|
| **Document Title** | ClimateX User Personas & Stakeholder Profiles |
| **Version** | 1.0 |
| **Status** | Draft for Review |
| **Classification** | Confidential |
| **Volume** | 1 — Foundation & System Architecture |
| **Chapter** | 5 — User Personas & Stakeholder Profiles |
| **Date** | July 2026 |
| **Predecessor** | Chapter 4 — Non-Functional Requirements Specification |
| **Total Personas** | 13 Primary + 15 External + 9 Organizational |
| **Total User Stories** | 50+ |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Stakeholder Categories](#2-stakeholder-categories)
3. [Primary User Personas](#3-primary-user-personas)
4. [External User Personas](#4-external-user-personas)
5. [Organizational Personas](#5-organizational-personas)
6. [User Goals](#6-user-goals)
7. [User Journey Maps](#7-user-journey-maps)
8. [User Stories](#8-user-stories)
9. [Role & Permission Matrix](#9-role--permission-matrix)
10. [Communication Preferences](#10-communication-preferences)
11. [Accessibility & Inclusivity](#11-accessibility--inclusivity)
12. [User Satisfaction Metrics](#12-user-satisfaction-metrics)
13. [Persona Traceability Matrix](#13-persona-traceability-matrix)
14. [Conclusion](#14-conclusion)

---

## 1. Introduction

### 1.1 Purpose of This Document

This chapter defines the complete landscape of human and organizational actors who interact with the ClimateX platform. It establishes **who ClimateX is built for** — the real people in real organizations whose work depends on climate information. Every UI screen, workflow, permission model, notification channel, and feature developed in subsequent volumes should trace back to the personas defined here.

### 1.2 Why Personas Matter for ClimateX

ClimateX is not a generic platform. It serves a uniquely diverse user community:

- Climate scientists who need raw data and computational power
- Farmers who need simple, actionable forecasts in local languages
- Government ministers who need executive summaries for policy decisions
- Disaster managers who need real-time alerts during emergencies
- Journalists who need accessible, authoritative climate information
- Students who need learning resources and data for research

This diversity means that **designing for one user type at the expense of others would be a fundamental failure**. The co-production vision (Chapter 1, Section 4) demands that all voices are represented in the platform design.

### 1.3 How Personas Are Used

| Purpose | Application |
|---|---|
| **UX/UI Design** | Screen layouts, navigation flow, information architecture, visual hierarchy |
| **Feature Prioritization** | Which features deliver most value to which personas; backlog prioritization |
| **Workflow Design** | End-to-end processes that match how users actually work |
| **Permission Modelling** | Role definitions, access control rules, approval hierarchies |
| **Communication Design** | Channel selection, notification timing, content formatting |
| **Testing & QA** | Test scenario generation, usability testing participant profiles |
| **Documentation & Training** | User guides, help content, training materials tailored to user types |
| **Accessibility** | Ensuring platform meets the needs of users with disabilities across all roles |

### 1.4 Document Structure

This document categorizes actors into three levels:

1. **Primary User Personas** (Section 3) — Individual users who actively use ClimateX as part of their daily work. 13 detailed personas covering internal platform roles.
2. **External User Personas** (Section 4) — Individual users who consume climate products or interact with the platform from outside. 15 detailed personas.
3. **Organizational Personas** (Section 5) — Institutions and agencies that interact with ClimateX at an organizational level. 9 organizational profiles.

Each persona includes the attributes defined in the chapter brief, and all personas are cross-referenced in the traceability matrix (Section 13).

### 1.5 Relationship to Previous Chapters

| Chapter | Connection to Personas |
|---|---|
| **Ch. 1 — Vision** | Personas represent the 16 target user communities defined in the vision |
| **Ch. 2 — Business Requirements** | Personas operationalize stakeholder needs defined in the BRD |
| **Ch. 3 — Functional Requirements** | Every FR is now mapped to the personas who use it |
| **Ch. 4 — Non-Functional Requirements** | Performance, usability, and accessibility targets are defined per persona type |

---

## 2. Stakeholder Categories

### 2.1 Categorization Framework

ClimateX stakeholders are organized into eight categories based on their relationship to the platform. This framework ensures that no stakeholder group is overlooked and that the platform serves the full ecosystem of actors involved in climate services co-production.

### 2.2 Internal Stakeholders

**Definition**: Individuals employed by or affiliated with the organization operating ClimateX (e.g., the National Meteorological and Hydrological Service).

| Stakeholder | Relationship to ClimateX |
|---|---|
| Climate Forecaster | Primary producer of climate information products |
| Climate Scientist | Domain expert providing scientific guidance and validation |
| Meteorologist | Short-range weather forecasting and product generation |
| GIS Specialist | Spatial data analysis, map production, and geospatial services |
| Data Analyst | Data quality management, analytics, and reporting |
| Climate Services Officer | User liaison, product customization, and stakeholder engagement |
| Administrator | Platform configuration, user management, and operational control |
| Executive Director | Strategic oversight, resource allocation, and external representation |
| IT Administrator | Technical operations, infrastructure management, and support |
| AI Analyst | AI model development, training, validation, and monitoring |
| Communications Officer | Public engagement, media relations, and content dissemination |
| Product Reviewer | Quality control and approval before product publication |
| Quality Assurance Officer | System testing, acceptance verification, and standards compliance |

### 2.3 External Stakeholders

**Definition**: Individuals outside the operating organization who consume, contribute to, or are affected by ClimateX products.

| Stakeholder | Relationship to ClimateX |
|---|---|
| Farmer | End-user of agro-climate products and advisory services |
| Water Resource Manager | User of hydrological forecasts for water allocation decisions |
| Disaster Risk Manager | User of early warning products for emergency preparedness |
| Health Officer | User of climate-health products for disease early warning |
| Energy Planner | User of climate products for energy demand and renewable planning |
| Aviation Officer | User of aviation weather products for flight safety |
| Marine Officer | User of marine weather products for maritime operations |
| NGO Representative | Intermediary delivering climate services to communities |
| County Government Officer | Sub-national user of climate products for local planning |
| National Government Officer | Policy-level user of climate information |
| University Researcher | User of climate data for academic research |
| Student | Learner accessing climate data and educational resources |
| Journalist | Communicator translating climate information for public audiences |
| General Public User | Citizen accessing weather and climate information |
| International Partner | External agency collaborating on climate services |

### 2.4 Government Agencies

**Relationship to ClimateX**: Government agencies are both data providers and primary consumers of ClimateX products. They may host ClimateX deployments, provide observational data, fund operations, and use products for policy, planning, and emergency response.

**Examples**: Ministries of Agriculture, Water, Energy, Health, Environment, Disaster Management, Aviation, and Marine Affairs. National statistical offices and planning commissions.

### 2.5 Research Institutions

**Relationship to ClimateX**: Research institutions provide scientific expertise, validation, and innovation. They use ClimateX data for research, contribute new methodologies, and help translate scientific advances into operational products.

**Examples**: Universities, national research institutes, international agricultural research centres (e.g., CGIAR), and climate research programmes.

### 2.6 Development Partners

**Relationship to ClimateX**: Development partners provide funding, technical assistance, and capacity-building support. They have a strategic interest in ClimateX's success and sustainability.

**Examples**: World Bank, UNDP, WMO, African Development Bank, bilateral donors (USAID, UK FCDO, EU), and climate finance mechanisms (Green Climate Fund, Adaptation Fund).

### 2.7 Private Sector

**Relationship to ClimateX**: Private sector stakeholders use climate products for operational decisions, risk management, and commercial services. They may also provide data, technology, or value-added services through the platform.

**Examples**: Insurance companies, agribusinesses, renewable energy companies, commodity traders, logistics firms, consulting firms, and technology vendors.

### 2.8 Community Users

**Relationship to ClimateX**: Community users are the ultimate beneficiaries of climate services. They may access products indirectly through intermediaries (NGOs, extension officers) or directly through mobile-friendly interfaces.

**Examples**: Smallholder farmers, pastoralists, fishing communities, urban residents in informal settlements, and community-based organizations.

### 2.9 International Organizations

**Relationship to ClimateX**: International organizations provide standards, data, governance frameworks, and coordination mechanisms. They may also be users of aggregated climate information for global monitoring and reporting.

**Examples**: WMO, UNFCCC, IPCC, UNDRR, WHO, FAO, WFP, IFRC, and regional climate centres (ICPAC, IGAD, SADC, CILSS).

---

## 3. Primary User Personas

### 3.1 Persona P01 — Climate Forecaster

| Field | Detail |
|---|---|
| **Persona ID** | P01 |
| **Name** | Dr. Amara Osei |
| **Role** | Senior Climate Forecaster |
| **Organization Type** | National Meteorological and Hydrological Service (NMHS) |
| **Background** | Amara holds a PhD in Climatology with 12 years of experience in operational forecasting. She previously worked at a Regional Climate Centre and has published research on seasonal prediction skill. She is well-respected in the regional forecasting community. |
| **Responsibilities** | Produce seasonal and sub-seasonal climate outlooks; coordinate forecast consensus meetings; validate forecast skill; mentor junior forecasters; contribute to national climate bulletins. |
| **Daily Activities** | Reviews morning GFS and ECMWF updates; checks CHIRPS rainfall data; runs statistical forecast models; prepares seasonal outlook briefing; meets with sectoral users; documents forecast confidence and uncertainty. |
| **Goals** | Produce the most accurate possible forecasts; communicate forecast uncertainty clearly; continuously improve skill through verification; ensure products reach users in time for decision-making. |
| **Motivations** | Scientific excellence; public service; desire to see forecasts translated into actions that save lives and livelihoods; professional recognition. |
| **Pain Points** | Manual data processing from multiple sources; poor data quality from observation networks; limited computational resources for ensemble downscaling; time pressure during forecast release; difficulty conveying probabilistic information to non-specialist users. |
| **Challenges** | Maintaining forecast skill during transition seasons; handling missing data; balancing scientific rigour with operational deadlines; training users to interpret probabilistic forecasts. |
| **Technology Proficiency** | High. Comfortable with Linux, Python, R, GrADS, CDO, NCL, GIS software. Uses Jupyter notebooks for analysis. Moderate comfort with web applications. |
| **Preferred Devices** | Desktop workstation (primary), laptop, tablet for briefings |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Observational data (station, satellite, reanalysis), NWP model outputs (GFS, ECMWF, ICON), ensemble forecast data, historical climate data, derived climate indices (ENSO, IOD), forecast verification statistics |
| **Typical Workflows** | Data acquisition → quality control → model running → product generation → peer review → dissemination → verification |
| **Permissions Required** | Data ingestion, product creation, product editing, product publishing (after review), forecast tool access, data export |
| **Features Frequently Used** | Data integration, climate product generation (template editing), GIS mapping, forecast verification, analytics dashboard, knowledge hub (research papers) |
| **Success Criteria** | Forecast skill scores improve year-on-year; products are released on schedule; sectoral users report high satisfaction with forecast utility. |
| **Representative User Story** | "As a Climate Forecaster, I want to automatically ingest data from multiple global models and observation networks into a unified workflow, so that I can spend more time on analysis and interpretation and less on data wrangling." |

### 3.2 Persona P02 — Climate Scientist

| Field | Detail |
|---|---|
| **Persona ID** | P02 |
| **Name** | Prof. James Munyua |
| **Role** | Climate Scientist / Research Lead |
| **Organization Type** | University / Research Institute |
| **Background** | James has 20 years of experience in climate research with a focus on East African rainfall dynamics. He leads a research group of 8 PhD students and postdocs. He serves on national and regional climate science advisory panels. |
| **Responsibilities** | Lead climate research programmes; supervise graduate students; publish peer-reviewed research; advise government on climate science; contribute to IPCC and national communications. |
| **Daily Activities** | Reviews literature; analyses climate model outputs; supervises students; writes research proposals; meets with collaborators; reviews papers; prepares presentations. |
| **Goals** | Advance understanding of regional climate processes; produce high-impact research publications; secure research funding; mentor next-generation climate scientists. |
| **Motivations** | Scientific curiosity; contribution to societal good; academic recognition; building research capacity in Africa. |
| **Pain Points** | Limited access to high-resolution climate data; computational constraints for running regional climate models; data in incompatible formats; difficulty accessing real-time operational data; minimal collaboration channels with operational forecasters. |
| **Challenges** | Bridging research and operational forecasting; securing sustained research funding; data sharing restrictions; attracting and retaining talent. |
| **Technology Proficiency** | High. Expert in Python, R, MATLAB, climate model frameworks (WRF, RegCM), version control, HPC environments. |
| **Preferred Devices** | Desktop workstation (high-performance), laptop, HPC cluster access |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | CMIP6 projections, CORDEX regional simulations, reanalysis datasets (ERA5), observational data for validation, specialized climate indices |
| **Typical Workflows** | Research question formulation → data acquisition → analysis → visualization → publication → dissemination |
| **Permissions Required** | Data access (full archives), data download, knowledge hub contribution, collaboration space access |
| **Features Frequently Used** | Data catalogue, data download, GIS mapping (advanced), analytics (research), knowledge hub, collaboration workspaces |
| **Success Criteria** | Research publications citing ClimateX data; research findings incorporated into operational products; successful grant applications leveraging ClimateX data. |
| **Representative User Story** | "As a Climate Scientist, I want to access high-resolution historical climate data and model outputs through a single platform with standardized formats, so that I can focus my research on scientific questions rather than data wrangling." |

### 3.3 Persona P03 — Meteorologist

| Field | Detail |
|---|---|
| **Persona ID** | P03 |
| **Name** | Grace Wanjiku |
| **Role** | Senior Meteorologist |
| **Organization Type** | NMHS — Weather Forecasting Division |
| **Background** | Grace has 8 years of experience in operational weather forecasting. She specializes in nowcasting and severe weather warnings. She is responsible for the daily weather bulletin and public weather alerts. |
| **Responsibilities** | Produce daily weather forecasts; issue severe weather warnings; monitor real-time observations; coordinate with disaster management during emergencies; manage weather observation network. |
| **Daily Activities** | Morning brief with forecast team; checks satellite and radar imagery; runs NWP models; prepares public weather bulletin; issues warnings if needed; conducts afternoon forecast review; updates social media with weather information. |
| **Goals** | Provide accurate and timely weather information; ensure warnings reach vulnerable populations; minimize false alarms while avoiding missed events. |
| **Motivations** | Public safety; professional pride in accurate forecasts; direct impact on community well-being. |
| **Pain Points** | Fragmented tools for different data types (satellite, radar, model); limited automation in bulletin generation; difficulty integrating climate outlooks with weather forecasts; warning dissemination channels are manual and slow. |
| **Challenges** | Nowcasting in data-sparse regions; communicating uncertainty in warnings; maintaining 24/7 coverage with limited staffing; balancing speed and accuracy. |
| **Technology Proficiency** | Medium-High. Proficient in meteorological software (SYNOP, METAR, satellite imagery viewers), comfortable with web platforms, basic Python skills. |
| **Preferred Devices** | Desktop workstation (primary), tablet (for briefings), smartphone (for alerts) |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Real-time observations (SYNOP, METAR, satellite, radar), NWP model outputs (global and high-resolution), lightning data, upper air observations |
| **Typical Workflows** | Observation monitoring → model analysis → forecast formulation → product generation → warning decision → dissemination |
| **Permissions Required** | Weather product creation, warning issuance, bulletin publishing, observation data access |
| **Features Frequently Used** | Data integration, product generation (weather bulletins), GIS mapping, dissemination management, dashboard (real-time monitoring) |
| **Success Criteria** | Warning lead time meets WMO guidelines; public satisfaction with forecast accuracy; reduced false alarm rate. |
| **Representative User Story** | "As a Meteorologist, I want a unified workstation where I can overlay satellite imagery, radar, and model outputs on one map, so that I can make faster and more confident warning decisions." |

### 3.4 Persona P04 — GIS Specialist

| Field | Detail |
|---|---|
| **Persona ID** | P04 |
| **Name** | Samuel Kibet |
| **Role** | GIS Specialist |
| **Organization Type** | NMHS — GIS and Remote Sensing Unit |
| **Background** | Samuel has 10 years of experience in geospatial analysis and remote sensing. He holds an MSc in Geographic Information Systems. He manages the GIS infrastructure and produces all map-based climate products. |
| **Responsibilities** | Produce GIS maps for climate products; manage spatial data infrastructure; process satellite imagery; develop web map services; train staff on GIS tools; maintain geospatial databases. |
| **Daily Activities** | Processes satellite imagery (MODIS, Sentinel, Landsat); updates GIS layers; produces maps for bulletins; supports forecasters with spatial analysis; maintains map servers; responds to GIS data requests. |
| **Goals** | Deliver high-quality spatial data products; build a comprehensive geospatial database; enable others to create their own maps through self-service tools. |
| **Motivations** | Technical excellence; seeing maps used for decision-making; building a lasting spatial data infrastructure. |
| **Pain Points** | Manual map production is time-consuming; satellite data downloads are slow; limited bandwidth for large imagery files; map styling needs frequent adjustments; users request non-standard map formats. |
| **Challenges** | Keeping up with satellite data volume; maintaining metadata standards; ensuring spatial data interoperability; balancing custom requests with standardization. |
| **Technology Proficiency** | High. Expert in QGIS, ArcGIS, GDAL, PostGIS, MapServer, GeoServer, Python (geospatial libraries), satellite data processing tools. |
| **Preferred Devices** | Desktop workstation (high-performance), large monitor(s) for map production |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Satellite imagery (optical, thermal, microwave), digital elevation models, land use/land cover data, administrative boundaries, hydrological networks, climate station locations |
| **Typical Workflows** | Data acquisition → preprocessing → analysis → map production → review → publication → archive |
| **Permissions Required** | GIS data upload, map layer management, map product creation, spatial data export, server configuration |
| **Features Frequently Used** | GIS mapping (advanced), data integration (satellite), product generation (maps), spatial data catalogue, API access (WMS/WFS) |
| **Success Criteria** | Map production time reduced by 50%; GIS uptime meets 99.9%; users can create basic maps through self-service tools. |
| **Representative User Story** | "As a GIS Specialist, I want a platform that provides self-service map creation tools for non-GIS users, so that I can focus on complex spatial analysis instead of producing routine maps." |

### 3.5 Persona P05 — Data Analyst

| Field | Detail |
|---|---|
| **Persona ID** | P05 |
| **Name** | Faith Njoki |
| **Role** | Data Analyst |
| **Organization Type** | NMHS — Data Management Unit |
| **Background** | Faith has 6 years of experience in data analysis and management. She holds a degree in Statistics and Computer Science. She is responsible for data quality, analytics, and reporting. |
| **Responsibilities** | Monitor data quality from observation networks; produce analytics dashboards; prepare performance reports; support decision-making with data analysis; manage climate databases. |
| **Daily Activities** | Checks data ingestion logs; runs quality control reports; updates analytics dashboards; responds to ad-hoc data requests; maintains database documentation; supports forecasters with data queries. |
| **Goals** | Ensure high-quality data for all climate products; provide actionable insights through analytics; automate routine reporting. |
| **Motivations** | Data-driven decision-making; efficiency improvements; professional development in data science. |
| **Pain Points** | Manual quality control processes; data from multiple sources in different formats; limited analytics tooling; ad-hoc report requests disrupt planned work. |
| **Challenges** | Inconsistent data quality from different sources; database performance with growing data volumes; balancing operational support with improvement projects. |
| **Technology Proficiency** | High. Proficient in SQL, Python, R, Power BI/Tableau, Excel (advanced), database management, ETL pipelines. |
| **Preferred Devices** | Desktop workstation, laptop |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Observation data (station), product generation metrics, user engagement analytics, system performance data, data quality statistics |
| **Typical Workflows** | Data quality monitoring → issue identification → resolution → reporting → dashboard updates |
| **Permissions Required** | Data management access, analytics dashboard creation, report generation, database query access |
| **Features Frequently Used** | Analytics dashboards, data integration (monitoring), administration (data management), reporting |
| **Success Criteria** | Data quality metrics meet targets; dashboards are adopted by management; routine reporting is automated. |
| **Representative User Story** | "As a Data Analyst, I want automated data quality monitoring and alerting, so that I can identify and resolve data issues before they affect climate products." |

### 3.6 Persona P06 — Climate Services Officer

| Field | Detail |
|---|---|
| **Persona ID** | P06 |
| **Name** | Esther Kemunto |
| **Role** | Climate Services Officer |
| **Organization Type** | NMHS — Climate Services Division |
| **Background** | Esther has 7 years of experience in climate services delivery. She holds an MSc in Climate Change Adaptation. She is the primary liaison between the NMHS and sectoral users. She organizes training workshops and user engagement forums. |
| **Responsibilities** | Engage with sectoral users to understand their climate information needs; customize products for specific sectors; conduct training on climate product interpretation; gather user feedback; promote climate services adoption. |
| **Daily Activities** | Responds to user inquiries; reviews product customization requests; prepares sector-specific bulletins; conducts user training sessions; collects feedback; meets with partner organizations. |
| **Goals** | Increase the uptake and effective use of climate products across all sectors; ensure products are relevant and accessible to end users. |
| **Motivations** | Seeing climate information translated into practical decisions; helping vulnerable communities; building lasting relationships with users. |
| **Pain Points** | Users request products that cannot currently be produced; feedback from users is not systematically captured; limited capacity to customize products for different sectors; users struggle to interpret probabilistic forecasts. |
| **Challenges** | Communicating complex climate information to non-specialist audiences; managing expectations; reaching users in remote areas with limited connectivity; translating scientific concepts into local languages. |
| **Technology Proficiency** | Medium. Comfortable with web applications, Microsoft Office, basic GIS viewers. Limited programming skills. |
| **Preferred Devices** | Laptop (primary), tablet (field visits), smartphone (communication) |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Sector-specific climate products, forecast interpretation guides, impact-based forecast information, product catalogues |
| **Typical Workflows** | User engagement → needs assessment → product customization → training → feedback collection → product improvement |
| **Permissions Required** | Product customization, user feedback access, training material creation, sector product creation |
| **Features Frequently Used** | Climate request management, product generation (customization), knowledge hub, user management, collaboration workspaces |
| **Success Criteria** | User adoption targets met; product satisfaction scores ≥ 80%; training participants demonstrate improved forecast interpretation. |
| **Representative User Story** | "As a Climate Services Officer, I want to easily customize climate products for different sectors and languages, so that each user community receives information that is directly relevant and understandable to them." |

### 3.7 Persona P07 — Administrator

| Field | Detail |
|---|---|
| **Persona ID** | P07 |
| **Name** | Thomas Ochieng |
| **Role** | Platform Administrator |
| **Organization Type** | NMHS — Administration |
| **Background** | Thomas has 15 years of administrative experience in the public service. He manages the ClimateX platform operations including user management, configuration, and coordination. |
| **Responsibilities** | Manage user accounts and roles; configure system settings; oversee platform operations; coordinate with IT on maintenance; manage service level agreements; prepare operational reports. |
| **Daily Activities** | Reviews user access requests; approves role changes; checks system status; coordinates with IT team; responds to administrative inquiries; prepares operational reports. |
| **Goals** | Ensure smooth platform operations; maintain secure and appropriate access control; keep platform configuration aligned with organizational policies. |
| **Motivations** | Operational efficiency; security and compliance; reliable service delivery. |
| **Pain Points** | User management is time-consuming; configuration changes require technical skills; reporting is manual; audit requests require significant effort. |
| **Challenges** | Balancing security with user convenience; managing role changes as staff turnover; keeping documentation up to date; coordinating across multiple departments. |
| **Technology Proficiency** | Medium. Proficient in web applications, spreadsheet software, basic system administration. |
| **Preferred Devices** | Desktop, laptop |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Platform usage statistics, user activity reports, system health status, operational metrics |
| **Typical Workflows** | User request → verification → account creation/role assignment → notification → documentation |
| **Permissions Required** | User management, system configuration, audit log access, role management, platform administration |
| **Features Frequently Used** | Administration (user management, system settings), audit logs, analytics dashboards (operational) |
| **Success Criteria** | User management requests processed within 24 hours; audit findings show zero unauthorized access; platform configuration is fully documented. |
| **Representative User Story** | "As an Administrator, I want a user-friendly interface for managing accounts, roles, and permissions, so that I can efficiently control platform access without requiring technical support." |

### 3.8 Persona P08 — Executive Director

| Field | Detail |
|---|---|
| **Persona ID** | P08 |
| **Name** | Dr. Rebecca Akinyi |
| **Role** | Director of Meteorological Services |
| **Organization Type** | NMHS — Directorate |
| **Background** | Rebecca has 25 years of experience in meteorological services. She holds a PhD in Atmospheric Science. She represents the NMHS at national, regional, and international forums. She is ultimately responsible for the organization's performance and strategic direction. |
| **Responsibilities** | Strategic leadership; resource mobilization; stakeholder engagement at the highest level; organizational performance oversight; policy representation. |
| **Daily Activities** | Reviews executive briefings; meets with senior government officials; approves strategic plans; reviews organizational performance reports; engages with development partners; represents the organization at high-level meetings. |
| **Goals** | Strengthen the organization's capacity to deliver world-class climate services; secure sustainable funding; elevate the organization's profile nationally and internationally. |
| **Motivations** | Organizational legacy; national development impact; professional reputation; building a climate-resilient nation. |
| **Pain Points** | Limited visibility into operational performance; difficulty demonstrating impact to funders and government; manual reporting processes; lack of executive-level decision support tools. |
| **Challenges** | Competing priorities for limited resources; political and bureaucratic pressures; attracting and retaining skilled staff; balancing operational and strategic demands. |
| **Technology Proficiency** | Low-Medium. Comfortable with email, office applications, and dashboards. Does not perform technical tasks. |
| **Preferred Devices** | Laptop, tablet, smartphone |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Executive summaries, organizational performance dashboards, high-level impact reports, funding and partnership opportunities |
| **Typical Workflows** | Briefing → decision-making → delegation → monitoring → reporting |
| **Permissions Required** | Executive dashboard access, report access, approval authority (strategic), user management (delegated) |
| **Features Frequently Used** | Analytics dashboard (executive), reporting, knowledge hub (policy briefs), collaboration (strategic partners) |
| **Success Criteria** | Platform demonstrates measurable impact; funding secured for platform sustainability; organization recognized as a regional leader in climate services. |
| **Representative User Story** | "As an Executive Director, I want an executive dashboard that shows real-time organizational performance, impact metrics, and resource utilization, so that I can make informed strategic decisions and demonstrate value to funders and government." |

### 3.9 Persona P09 — IT Administrator

| Field | Detail |
|---|---|
| **Persona ID** | P09 |
| **Name** | Patrick Muliro |
| **Role** | IT Administrator |
| **Organization Type** | NMHS — ICT Unit |
| **Background** | Patrick has 12 years of experience in IT infrastructure and systems administration. He manages the NMHS's servers, networks, and enterprise applications. He is responsible for the technical operations of ClimateX. |
| **Responsibilities** | Server and infrastructure management; system deployment and updates; security monitoring; backup and disaster recovery; user support; network administration. |
| **Daily Activities** | Monitors system health; reviews security logs; applies patches; manages backups; responds to support tickets; manages user accounts (technical); coordinates with cloud provider. |
| **Goals** | Maintain high system availability; ensure data security; automate operational tasks; build resilient infrastructure. |
| **Motivations** | Technical reliability; problem-solving; continuous learning. |
| **Pain Points** | Manual deployment processes; limited monitoring tooling; insufficient documentation; on-call burden with small team; complex troubleshooting in distributed systems. |
| **Challenges** | Limited budget for enterprise tools; bandwidth constraints for cloud services; maintaining skills in rapidly evolving technologies; balancing security with usability. |
| **Technology Proficiency** | Expert. Proficient in Linux, Docker, Kubernetes, cloud platforms (AWS/Azure/GCP), networking, database administration, CI/CD, monitoring tools. |
| **Preferred Devices** | Desktop workstation (multiple monitors), laptop, tablet (for server room), smartphone (for alerts) |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | System metrics (CPU, memory, disk, network), application logs, security alerts, backup status, user support metrics |
| **Typical Workflows** | Monitoring → issue detection → diagnosis → resolution → documentation → prevention |
| **Permissions Required** | Full infrastructure access, database administration, security tool access, deployment pipeline management, user support tools |
| **Features Frequently Used** | Administration (system settings), observability (logs, metrics, alerts), deployment management, API management |
| **Success Criteria** | System uptime meets SLA; incidents resolved within defined SLAs; infrastructure provisioning is fully automated; security vulnerabilities are remediated within policy timelines. |
| **Representative User Story** | "As an IT Administrator, I want automated monitoring, alerting, and self-healing infrastructure, so that I can maintain high availability and reduce manual intervention in routine operations." |

### 3.10 Persona P10 — AI Analyst

| Field | Detail |
|---|---|
| **Persona ID** | P10 |
| **Name** | Dr. Michael Kamau |
| **Role** | AI / Machine Learning Analyst |
| **Organization Type** | NMHS — AI & Innovation Unit |
| **Background** | Michael holds a PhD in Computer Science with specialization in machine learning. He has 5 years of experience applying AI to environmental and climate problems. He leads the AI services development for ClimateX. |
| **Responsibilities** | Develop and maintain AI models (climate assistant, advisory generator, report generator, translation engine); manage model training pipelines; monitor model performance; research new AI applications for climate services. |
| **Daily Activities** | Reviews model performance metrics; retrains models with new data; develops new AI features; experiments with new approaches; documents model behavior; collaborates with forecasters on AI tool design. |
| **Goals** | Build AI services that meaningfully improve climate product quality and forecaster productivity; achieve high model accuracy and reliability. |
| **Motivations** | Cutting-edge AI application with real-world impact; technical innovation; publication opportunities. |
| **Pain Points** | Limited training data for climate-specific domains; computational resources for model training; integration complexity with platform services; difficulty measuring real-world impact of AI features. |
| **Challenges** | Balancing model complexity with inference speed; handling edge cases in climate data; ensuring model outputs are scientifically valid; explaining model behaviour to non-technical stakeholders. |
| **Technology Proficiency** | Expert. Python, TensorFlow/PyTorch, MLflow, NLP frameworks, LLM fine-tuning, vector databases, MLOps, Docker, GPU computing. |
| **Preferred Devices** | High-performance workstation, GPU server access, laptop |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Historical climate data (training), forecast products (validation), user interaction data (model improvement), evaluation metrics |
| **Typical Workflows** | Problem definition → data preparation → model development → training → evaluation → deployment → monitoring → iteration |
| **Permissions Required** | AI model management, training pipeline access, model deployment, data access (training datasets), evaluation tools |
| **Features Frequently Used** | AI services (all), analytics (model performance), data integration (training data access), knowledge hub (research) |
| **Success Criteria** | AI models achieve defined accuracy targets; AI features reduce product generation time by ≥ 30%; user satisfaction with AI tools ≥ 80%. |
| **Representative User Story** | "As an AI Analyst, I want a standardized MLOps pipeline for model training, evaluation, and deployment, so that I can rapidly iterate on AI models while maintaining quality and reliability." |

### 3.11 Persona P11 — Communications Officer

| Field | Detail |
|---|---|
| **Persona ID** | P11 |
| **Name** | Sarah Nyambura |
| **Role** | Communications Officer |
| **Organization Type** | NMHS — Communications & Public Relations |
| **Background** | Sarah has 8 years of experience in public communications, including 4 years in climate communications. She holds a degree in Journalism and Mass Communication. She manages the NMHS's public-facing communications and media relations. |
| **Responsibilities** | Manage public weather and climate communications; prepare press releases; maintain social media presence; respond to media inquiries; create public awareness content; manage the NMHS website and public portal. |
| **Daily Activities** | Prepares public weather bulletin for social media; responds to journalist inquiries; updates website content; creates awareness content (infographics, videos); monitors public feedback; coordinates media briefings. |
| **Goals** | Ensure accurate climate information reaches the widest possible audience; build public trust in NMHS products; communicate effectively during emergencies. |
| **Motivations** | Public service; communication effectiveness; seeing information save lives. |
| **Pain Points** | Manual content creation across multiple channels; difficulty translating technical products for public audiences; slow approval processes for public communications; limited metrics on content reach and impact. |
| **Challenges** | Simplifying complex climate information without losing accuracy; combating misinformation; reaching diverse language audiences; managing communications during high-pressure emergency situations. |
| **Technology Proficiency** | Medium. Proficient in social media platforms, content management systems, basic graphic design, video editing basics. |
| **Preferred Devices** | Laptop, smartphone (primary for social media), tablet |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Approved public weather and climate products, impact-based forecast information, warning information, organizational news and updates |
| **Typical Workflows** | Product receipt → content adaptation → approval → publication → monitoring → reporting |
| **Permissions Required** | Public portal content management, social media integration, dissemination management (public), analytics (communication metrics) |
| **Features Frequently Used** | Dissemination management, product catalogue (public), analytics (communication), collaboration (review/approval) |
| **Success Criteria** | Public reach metrics increase quarter-on-quarter; media coverage is accurate and cites NMHS products; public satisfaction with communications ≥ 85%. |
| **Representative User Story** | "As a Communications Officer, I want a unified content management system where I can adapt climate products for public audiences, manage approvals, and publish across multiple channels from one interface, so that I can communicate quickly and consistently during emergencies." |

### 3.12 Persona P12 — Product Reviewer

| Field | Detail |
|---|---|
| **Persona ID** | P12 |
| **Name** | David Mwangi |
| **Role** | Senior Product Reviewer |
| **Organization Type** | NMHS — Quality Assurance |
| **Background** | David has 18 years of experience in meteorological services. He previously served as a Chief Forecaster. He now oversees the quality review of all climate products before publication. |
| **Responsibilities** | Review and approve all climate products before publication; ensure compliance with quality standards; provide feedback to product authors; maintain quality documentation. |
| **Daily Activities** | Reviews pending product approvals; checks data accuracy and formatting; validates forecast reasoning; provides feedback to forecasters; updates quality checklists; participates in product improvement meetings. |
| **Goals** | Maintain high and consistent product quality; ensure all products meet established standards; reduce errors reaching end users. |
| **Motivations** | Professional standards; organizational reputation; mentoring junior staff. |
| **Pain Points** | Review process is manual and time-consuming; reviewers lack tools for efficient comparison; difficult to enforce consistent standards across different product types; feedback loop is slow. |
| **Challenges** | Balancing quality with timeliness; maintaining standards when staffing is stretched; keeping quality documentation current; training new reviewers. |
| **Technology Proficiency** | Medium. Comfortable with web applications, email, document tools. Prefers structured review interfaces. |
| **Preferred Devices** | Desktop, laptop |
| **Accessibility Considerations** | Wears reading glasses; prefers larger font sizes in review interfaces |
| **Climate Information Needs** | All pending products for review, quality standards documentation, reference data for validation |
| **Typical Workflows** | Review notification → product examination → validation → approval/rejection → feedback → documentation |
| **Permissions Required** | Product review access, product approval authority, quality metrics access |
| **Features Frequently Used** | Product review workflow, quality checks, collaboration (feedback), analytics (quality metrics) |
| **Success Criteria** | Review turnaround within defined SLA; product quality scores meet targets; end-user error reports reduced. |
| **Representative User Story** | "As a Product Reviewer, I want a structured review interface that shows product content alongside quality checklists and reference data, so that I can conduct thorough reviews efficiently and consistently." |

### 3.13 Persona P13 — Quality Assurance Officer

| Field | Detail |
|---|---|
| **Persona ID** | P13 |
| **Name** | Christine Achieng |
| **Role** | Quality Assurance Officer |
| **Organization Type** | NMHS — Quality Management |
| **Background** | Christine has 9 years of experience in quality assurance for information systems. She holds a degree in Information Systems and a QA certification. She is responsible for testing and quality verification of the ClimateX platform itself. |
| **Responsibilities** | Develop test plans; execute functional and non-functional testing; report defects; verify fixes; maintain test documentation; support UAT with users. |
| **Daily Activities** | Reviews new features; executes test cases; logs and tracks defects; verifies bug fixes; updates test documentation; participates in release planning. |
| **Goals** | Ensure ClimateX releases are of high quality with minimal defects; build comprehensive test coverage; establish automated regression testing. |
| **Motivations** | Quality excellence; preventing defects reaching production; continuous improvement. |
| **Pain Points** | Limited test automation; insufficient time for thorough testing in release cycles; difficulty reproducing environment-specific issues; test data management is manual. |
| **Challenges** | Balancing coverage with release velocity; keeping test documentation synchronized with rapid development; testing across multiple environment configurations. |
| **Technology Proficiency** | Medium-High. Proficient in test management tools, Selenium/Playwright, API testing tools, SQL, defect tracking systems. |
| **Preferred Devices** | Desktop workstation, laptop, multiple browsers/devices for testing |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Test data sets, requirement documents, release notes, defect reports |
| **Typical Workflows** | Test planning → test case development → test execution → defect reporting → verification → closure |
| **Permissions Required** | Test environment access, test data management, defect tracker access, requirement access (read) |
| **Features Frequently Used** | All modules (test perspective), administration (test environment), reporting (test metrics) |
| **Success Criteria** | Release defect rate ≤ 5 critical/high defects per release; test automation coverage ≥ 70%; regression test execution time ≤ 4 hours. |
| **Representative User Story** | "As a Quality Assurance Officer, I want automated regression testing integrated into the CI/CD pipeline, so that I can focus exploratory testing on new features rather than manual regression." |

---

## 4. External User Personas

### 4.1 Persona E01 — Farmer

| Field | Detail |
|---|---|
| **Persona ID** | E01 |
| **Name** | Joseph Lekishon |
| **Role** | Smallholder Farmer |
| **Organization Type** | Agricultural household |
| **Location** | Rural area, limited infrastructure |
| **Background** | Joseph is a 45-year-old smallholder farmer in a semi-arid region. He grows maize, beans, and keeps livestock. He has primary-level education. His farming decisions depend heavily on rainfall patterns. He is part of a local farmer cooperative. |
| **Responsibilities** | Crop cultivation, livestock management, household food security |
| **Daily Activities** | Tends crops and livestock; checks weather; sources inputs; sells produce at local market; participates in cooperative meetings |
| **Goals** | Achieve reliable harvests; protect livestock during drought; access timely planting advice |
| **Motivations** | Family well-being; community respect; economic stability |
| **Pain Points** | Weather information is too general; forecasts don't reach him in time; information is in English, not his local language; lacks confidence to act on forecasts |
| **Challenges** | Low literacy; limited mobile internet access; no smartphone (feature phone user); distrust of forecasts after past inaccuracies |
| **Technology Proficiency** | Low. Uses basic feature phone for calls and SMS. Limited experience with smartphone apps. |
| **Preferred Devices** | Basic feature phone (primary), occasionally borrows smartphone |
| **Accessibility Considerations** | Limited literacy; prefers voice-based communication; local language only |
| **Climate Information Needs** | 3–7 day weather forecast (plain language), seasonal outlook (start of rains, expected total rainfall), drought early warning, planting advisory |
| **Typical Workflows** | Receives SMS alert → discusses with cooperative → decides on action → implements → observes outcome |
| **Permissions Required** | None (public user) |
| **Features Frequently Used** | Public portal (mobile), SMS alerts, voice-based information |
| **Success Criteria** | Receives actionable climate information; understands and trusts the information; takes action that improves his harvest or reduces loss. |
| **Representative User Story** | "As a Farmer, I want to receive simple, actionable weather and climate information in my local language via SMS or voice, so that I can make better planting and harvesting decisions." |

### 4.2 Persona E02 — Water Resource Manager

| Field | Detail |
|---|---|
| **Persona ID** | E02 |
| **Name** | Grace Chelangat |
| **Role** | Water Resource Manager |
| **Organization Type** | Regional Water Resources Authority |
| **Background** | Grace is a 38-year-old water engineer with 12 years of experience in water resources management. She manages water allocation for irrigation, domestic use, and hydropower across a large river basin. |
| **Responsibilities** | Water allocation decisions; reservoir management; drought contingency planning; water quality monitoring; stakeholder coordination. |
| **Daily Activities** | Reviews river flow data; checks reservoir levels; updates water allocation schedule; coordinates with irrigation schemes; prepares water situation reports; participates in drought task force meetings. |
| **Goals** | Ensure equitable water allocation during scarcity; maintain reservoir levels for dry season; provide early warning of water shortages. |
| **Motivations** | Water security; public health; sustainable resource management. |
| **Pain Points** | Rainfall forecasts are not translated into runoff predictions; limited integration with hydrological models; data from multiple sources is fragmented; no basin-level decision support tools. |
| **Challenges** | Balancing competing water demands during drought; uncertainty in seasonal forecasts; limited hydrological monitoring network; coordination across multiple agencies. |
| **Technology Proficiency** | Medium-High. Proficient in hydrological modelling software, GIS, database tools, Excel. |
| **Preferred Devices** | Desktop workstation, laptop, tablet (field inspections) |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Seasonal rainfall outlook, river flow forecasts, drought indices (SPI, SPEI), reservoir inflow forecasts, evapotranspiration data |
| **Typical Workflows** | Data review → situation assessment → decision → communication → monitoring → adjustment |
| **Permissions Required** | Sector-specific product access (water), data download, API access (for hydrological models) |
| **Features Frequently Used** | Climate products (hydrological), GIS mapping (water resources), data download, analytics (water) |
| **Success Criteria** | Water allocation decisions are informed by timely climate information; drought warnings provide sufficient lead time for contingency planning. |
| **Representative User Story** | "As a Water Resource Manager, I want access to integrated hydrological forecasts and drought indices on a single platform, so that I can make evidence-based water allocation decisions during dry periods." |

### 4.3 Persona E03 — Disaster Risk Manager

| Field | Detail |
|---|---|
| **Persona ID** | E03 |
| **Name** | Colonel James Barasa (Rtd.) |
| **Role** | Disaster Risk Manager |
| **Organization Type** | National Disaster Management Authority |
| **Background** | James is a retired military officer with 22 years of service, including 8 years in disaster response coordination. He now leads the disaster preparedness and early warning unit. He manages the national emergency operations centre. |
| **Responsibilities** | Coordinate disaster preparedness; manage early warning systems; lead emergency response coordination; conduct post-disaster assessments; maintain contingency plans. |
| **Daily Activities** | Monitors weather alerts; convenes emergency coordination meetings; deploys response resources; briefs senior officials; updates situation reports; conducts public safety messaging. |
| **Goals** | Minimize loss of life and property from natural hazards; ensure communities receive timely warnings; coordinate effective emergency response. |
| **Motivations** | Saving lives; public safety; professional duty. |
| **Pain Points** | Warning information from NMHS is not impact-based; alerts are not integrated with GIS for targeting; coordination with NMHS is manual; no common operational picture tool. |
| **Challenges** | Reaching last-mile communities; false alarm management; inter-agency coordination; resource constraints for response. |
| **Technology Proficiency** | Medium. Proficient in emergency management systems, GIS viewers, radio communication, mobile apps. |
| **Preferred Devices** | Desktop (operations centre), laptop, tablet (field coordination), satellite phone |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Severe weather warnings, impact-based forecasts, heavy rainfall and flood alerts, tropical cyclone tracking, drought early warning, seasonal outlook |
| **Typical Workflows** | Alert received → impact assessment → coordination meeting → response deployment → monitoring → reporting |
| **Permissions Required** | Warning information access, GIS data access, alert configuration (for dissemination) |
| **Features Frequently Used** | Climate products (warnings), GIS mapping (hazard layers), dissemination management (public alerts), collaboration (inter-agency) |
| **Success Criteria** | Warning lead time sufficient for evacuation; accurate hazard impact assessment; coordinated multi-agency response enabled by shared information. |
| **Representative User Story** | "As a Disaster Risk Manager, I want impact-based forecasts integrated with GIS hazard mapping, so that I can target warnings and response to the specific communities at risk." |

### 4.4 Persona E04 — Health Officer

| Field | Detail |
|---|---|
| **Persona ID** | E04 |
| **Name** | Dr. Fatima Hassan |
| **Role** | Public Health Officer |
| **Organization Type** | Ministry of Health — Disease Surveillance Unit |
| **Background** | Fatima is a 42-year-old epidemiologist with 15 years in public health. She specializes in climate-sensitive diseases including malaria, Rift Valley fever, and cholera. She leads the climate-health early warning programme. |
| **Responsibilities** | Disease surveillance; climate-health early warning; outbreak investigation; public health advisory development; inter-sectoral coordination. |
| **Daily Activities** | Reviews disease surveillance data; checks climate forecasts for disease risk; prepares health early warnings; coordinates with NMHS; briefs health ministry leadership; conducts field investigations. |
| **Goals** | Predict and prevent climate-sensitive disease outbreaks; reduce disease burden through early warning; strengthen health system resilience. |
| **Motivations** | Public health impact; saving lives; scientific contribution to disease prevention. |
| **Pain Points** | Climate data not tailored for health applications; limited integration of health and climate data; disease early warning models are not operationalized; lack of joint health-climate planning tools. |
| **Challenges** | Data sharing barriers between health and climate sectors; limited capacity for climate-health analysis; funding for integrated early warning systems. |
| **Technology Proficiency** | Medium. Proficient in health information systems, statistical software (STATA/R), GIS basics. |
| **Preferred Devices** | Laptop, tablet, smartphone |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Seasonal rainfall outlook, temperature forecasts, malaria/ RVF suitability indices, drought indices, extreme temperature warnings |
| **Typical Workflows** | Risk monitoring → alert assessment → advisory preparation → dissemination → response → evaluation |
| **Permissions Required** | Climate-health product access, data download, collaboration space access |
| **Features Frequently Used** | Climate products (health), GIS mapping (disease risk), analytics, collaboration (with NMHS) |
| **Success Criteria** | Climate-health early warnings provide actionable lead time; disease outbreaks are anticipated; health sector uses climate information routinely. |
| **Representative User Story** | "As a Health Officer, I want integrated climate-health risk products that translate climate forecasts into disease risk information, so that I can issue timely health advisories and preposition medical supplies." |

### 4.5 Persona E05 — Energy Planner

| Field | Detail |
|---|---|
| **Persona ID** | E05 |
| **Name** | Peter Ngugi |
| **Role** | Energy Planning Engineer |
| **Organization Type** | National Energy Regulatory Authority |
| **Background** | Peter is a 45-year-old energy engineer with 18 years of experience in energy sector planning. He specializes in renewable energy integration and grid management. |
| **Responsibilities** | Energy demand forecasting; renewable energy resource assessment; grid stability planning; hydropower reservoir management; energy policy development. |
| **Daily Activities** | Reviews energy demand data; checks hydropower reservoir levels; monitors renewable energy generation; updates energy outlook; prepares sector reports. |
| **Goals** | Ensure reliable energy supply; maximize renewable energy integration; optimize hydropower operations. |
| **Motivations** | Energy security; national development; climate change mitigation. |
| **Pain Points** | No access to tailored climate products for energy planning; seasonal forecasts not translated into hydropower generation forecasts; solar and wind resource data not readily available. |
| **Challenges** | Hydropower dependence on variable rainfall; increasing energy demand; integrating variable renewable energy; long-term climate change impacts on energy infrastructure. |
| **Technology Proficiency** | Medium-High. Proficient in energy modelling software, Excel (advanced), GIS basics, database tools. |
| **Preferred Devices** | Desktop workstation, laptop, tablet |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Seasonal rainfall outlook (hydropower), temperature forecasts (demand), solar radiation data, wind speed data, drought indices |
| **Typical Workflows** | Data collection → analysis → forecasting → planning → reporting → decision support |
| **Permissions Required** | Sector-specific product access (energy), data download, API access |
| **Features Frequently Used** | Climate products (energy), data download, analytics, GIS mapping (energy infrastructure) |
| **Success Criteria** | Energy sector planning is informed by climate forecasts; hydropower operations optimized based on seasonal outlook; renewable energy resource assessments use best available climate data. |
| **Representative User Story** | "As an Energy Planner, I want seasonal climate forecasts translated into hydropower generation outlooks and energy demand projections, so that I can plan energy supply and grid operations months ahead." |

### 4.6 Persona E06 — Aviation Officer

| Field | Detail |
|---|---|
| **Persona ID** | E06 |
| **Name** | Captain Ibrahim Mwinyi |
| **Role** | Aviation Weather Officer |
| **Organization Type** | National Aviation Authority |
| **Background** | Ibrahim is a 50-year-old aviation meteorologist with 25 years of experience. He provides weather briefing services for civil aviation and manages the aerodrome meteorological office. |
| **Responsibilities** | Provide aviation weather briefings; issue SIGMET and AIRMET warnings; manage aerodrome weather observations; ensure compliance with ICAO and WMO standards. |
| **Daily Activities** | Prepares aviation weather briefings; monitors METAR and SPECI reports; issues SIGMET for hazardous conditions; coordinates with air traffic control; maintains aviation weather instruments. |
| **Goals** | Ensure flight safety through accurate and timely weather information; meet ICAO standards for meteorological services. |
| **Motivations** | Aviation safety; professional standards; public responsibility. |
| **Pain Points** | Aviation weather products are manually produced; integration with global aviation systems is limited; observation network gaps affect briefing quality; no automated alerting for hazardous conditions. |
| **Challenges** | Meeting ICAO compliance requirements; maintaining 24/7 service with limited staff; equipment maintenance in remote airports. |
| **Technology Proficiency** | Medium. Proficient in aviation weather systems, METAR/TAF decoding, ICAO compliance tools. |
| **Preferred Devices** | Desktop workstation, tablet, smartphone (on-call) |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | METAR, SPECI, TAF, SIGMET, AIRMET, upper wind forecasts, volcanic ash advisories, tropical cyclone warnings |
| **Typical Workflows** | Observation review → forecast preparation → briefing → warning issuance → monitoring → update |
| **Permissions Required** | Aviation product access, aviation-specific product creation, warning issuance |
| **Features Frequently Used** | Climate products (aviation), data integration (observations), alerting, GIS mapping (flight routes) |
| **Success Criteria** | Aviation products meet ICAO standards; briefings are timely and accurate; warnings provide sufficient lead time for flight diversion. |
| **Representative User Story** | "As an Aviation Weather Officer, I want automated aviation weather product generation that meets ICAO standards, so that I can focus on hazard analysis and briefing quality." |

### 4.7 Persona E07 — Marine Officer

| Field | Detail |
|---|---|
| **Persona ID** | E07 |
| **Name** | Captain Fatuma Ali |
| **Role** | Marine Officer / Port Meteorological Officer |
| **Organization Type** | Maritime Authority |
| **Background** | Fatuma is a 44-year-old marine meteorologist with 16 years of experience in maritime operations. She provides marine weather services for shipping, fishing, and coastal communities. |
| **Responsibilities** | Marine weather forecasting; gale and storm surge warnings; port meteorological services; marine observation network; maritime safety information. |
| **Daily Activities** | Prepares marine forecasts; monitors sea state; issues gale warnings; coordinates with port authorities; maintains marine observation instruments; supports search and rescue operations. |
| **Goals** | Ensure maritime safety; support fishing communities with timely weather information; protect coastal infrastructure. |
| **Motivations** | Maritime safety; supporting fishing livelihoods; professional service. |
| **Pain Points** | Limited marine observation data; wave and storm surge models not available locally; marine product generation is manual; communication to fishing communities is challenging. |
| **Challenges** | Sparse marine observation network; communicating warnings to artisanal fishers; limited capacity for marine modelling. |
| **Technology Proficiency** | Medium. Proficient in marine forecasting tools, GIS, GPS, radio communication. |
| **Preferred Devices** | Desktop workstation, tablet, VHF radio, smartphone |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Sea surface temperature, wave height and period, wind speed and direction, storm surge forecasts, marine weather warnings, tide predictions |
| **Typical Workflows** | Observation review → forecast preparation → warning decision → dissemination → monitoring → update |
| **Permissions Required** | Marine product access, warning issuance |
| **Features Frequently Used** | Climate products (marine), data integration (marine observations), alerting, GIS mapping (coastal zones) |
| **Success Criteria** | Marine warnings provide sufficient lead time; fishing communities report receiving and acting on forecasts; port operations are supported by timely weather information. |
| **Representative User Story** | "As a Marine Officer, I want automated marine forecasts and storm surge warnings, so that I can ensure maritime safety and support fishing communities with timely information." |

### 4.8 Persona E08 — NGO Representative

| Field | Detail |
|---|---|
| **Persona ID** | E08 |
| **Name** | Mark Okello |
| **Role** | Programme Manager — Climate Adaptation |
| **Organization Type** | International NGO |
| **Background** | Mark is a 36-year-old development professional with 10 years of experience in climate adaptation programmes. He manages a portfolio of community-based adaptation projects across multiple counties. |
| **Responsibilities** | Design and manage climate adaptation projects; build community resilience; monitor project impact; report to donors; coordinate with government agencies. |
| **Daily Activities** | Reviews project progress; meets with community groups; prepares donor reports; coordinates with NMHS for climate information; trains field staff on climate services; monitors project budgets. |
| **Goals** | Build climate-resilient communities; ensure projects are evidence-based; demonstrate impact to donors. |
| **Motivations** | Community development; social justice; environmental sustainability. |
| **Pain Points** | Difficulty accessing reliable climate data for project design; climate products are not at community scale; limited capacity to interpret forecasts; no collaboration platform with NMHS. |
| **Challenges** | Bridging between technical climate information and community needs; ensuring project sustainability after funding ends; measuring adaptation impact. |
| **Technology Proficiency** | Medium. Proficient in office applications, project management tools, basic data analysis. |
| **Preferred Devices** | Laptop, smartphone (primary field communication), tablet |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Seasonal outlook (localized), rainfall data (historical and forecast), drought indices, flood risk information, climate projections (for project design) |
| **Typical Workflows** | Needs assessment → data collection → project design → implementation → monitoring → reporting |
| **Permissions Required** | Sector-specific product access, collaboration space access, data download |
| **Features Frequently Used** | Climate products, data download, GIS mapping, collaboration workspaces, knowledge hub |
| **Success Criteria** | Project designs are informed by best available climate data; communities receive climate information through projects; project outcomes are measured against climate variables. |
| **Representative User Story** | "As an NGO Programme Manager, I want access to localized climate data and forecasts that I can use to design evidence-based adaptation projects, so that my organization's interventions are effective and sustainable." |

### 4.9 Persona E09 — County Government Officer

| Field | Detail |
|---|---|
| **Persona ID** | E09 |
| **Name** | Jane Chebet |
| **Role** | County Director of Agriculture |
| **Organization Type** | County Government |
| **Background** | Jane is a 48-year-old agricultural officer with 20 years of experience in county-level agricultural extension. She manages a team of extension officers and coordinates with the NMHS for climate information. |
| **Responsibilities** | County agricultural planning; extension service management; farmer advisory services; food security monitoring; disaster response coordination. |
| **Daily Activities** | Reviews weather forecasts; briefs extension team; coordinates with NMHS; monitors crop conditions; reports to county executive; responds to farmer inquiries. |
| **Goals** | Improve agricultural productivity; enhance food security; build farmer resilience to climate variability. |
| **Motivations** | Public service; agricultural development; community well-being. |
| **Pain Points** | Climate information is not at county-level detail; forecasts arrive too late for planning; no easy way to communicate information to extension officers in the field; feedback from farmers not captured. |
| **Challenges** | Limited budget for climate services; extension officer capacity to interpret forecasts; reaching farmers in remote wards; integrating climate information into county plans. |
| **Technology Proficiency** | Medium. Proficient in office applications, basic GIS, mobile apps. |
| **Preferred Devices** | Laptop, smartphone, tablet |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Seasonal outlook (county-level), dekadal rainfall updates, drought monitoring, crop yield forecasts, early warning information |
| **Typical Workflows** | Information receipt → interpretation → dissemination to extension officers → farmer outreach → feedback collection → reporting |
| **Permissions Required** | County-level product access, data download, feedback submission |
| **Features Frequently Used** | Climate products, GIS mapping (county-level), collaboration (with NMHS), knowledge hub |
| **Success Criteria** | County agricultural plans incorporate climate information; farmers receive timely advisories; food security monitoring is climate-informed. |
| **Representative User Story** | "As a County Director of Agriculture, I want county-level climate forecasts and advisories that I can use to plan extension services and inform farmers, so that agricultural productivity is improved and losses from climate extremes are reduced." |

### 4.10 Persona E10 — National Government Officer

| Field | Detail |
|---|---|
| **Persona ID** | E10 |
| **Name** | Dr. Patrick Wanjohi |
| **Role** | Senior Policy Analyst |
| **Organization Type** | Ministry of Planning and National Development |
| **Background** | Patrick is a 52-year-economist with 25 years of experience in national development planning. He advises on climate resilience in national budgets, sector plans, and development strategies. |
| **Responsibilities** | Climate mainstreaming in national planning; policy analysis; budget review for climate sensitivity; reporting on climate-related SDG indicators. |
| **Daily Activities** | Reviews sector plans for climate integration; analyses climate data for policy briefs; prepares reports for cabinet; coordinates with MDAs on climate planning; monitors climate expenditure tracking. |
| **Goals** | Ensure national development plans are climate-resilient; mainstream climate risk across all sectors; access reliable climate data for policy analysis. |
| **Motivations** | National development; policy impact; sustainable development. |
| **Pain Points** | Limited access to synthesized climate information for policy; climate data not linked to economic planning; no tools for climate risk assessment in sector plans. |
| **Challenges** | Translating climate information into economic analysis; coordinating across multiple ministries; competing policy priorities. |
| **Technology Proficiency** | Medium. Proficient in office applications, statistical software, policy analysis tools. |
| **Preferred Devices** | Laptop, tablet |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | National climate summaries, sector-specific climate risk assessments, climate projections, economic analysis of climate impacts |
| **Typical Workflows** | Policy review → data analysis → brief preparation → stakeholder consultation → policy recommendation → monitoring |
| **Permissions Required** | National-level product access, data download, analytics access |
| **Features Frequently Used** | Climate products (national summaries), analytics, GIS mapping (national), reporting |
| **Success Criteria** | National plans reference ClimateX data; climate risk is assessed in sector budget submissions; policy briefs are informed by authoritative climate information. |
| **Representative User Story** | "As a Senior Policy Analyst, I want synthesized climate risk information that I can integrate into national development plans and sector budgets, so that climate resilience is mainstreamed across government planning." |

### 4.11 Persona E11 — University Researcher

| Field | Detail |
|---|---|
| **Persona ID** | E11 |
| **Name** | Dr. Lucia Anyango |
| **Role** | Senior Lecturer & Researcher |
| **Organization Type** | Public University — Department of Geography and Environmental Science |
| **Background** | Lucia is a 40-year-old academic with 12 years of teaching and research experience. She specializes in climate change impacts on agriculture and supervises graduate students. She collaborates with the NMHS on research projects. |
| **Responsibilities** | Teaching undergraduate and postgraduate courses; supervising research students; conducting research; publishing papers; securing research grants. |
| **Daily Activities** | Lectures students; supervises research; analyses data; writes papers; reviews manuscripts; prepares grant proposals; attends academic conferences. |
| **Goals** | Produce high-quality research; publish in reputable journals; secure research funding; train next-generation climate scientists. |
| **Motivations** | Academic excellence; contribution to knowledge; student development. |
| **Pain Points** | Limited access to high-quality climate data; data acquisition is time-consuming; data format incompatibility; research data is not available through a single platform; limited collaboration opportunities with operational agencies. |
| **Challenges** | Balancing teaching and research; securing research funding; accessing operational data for research; translating research into operational applications. |
| **Technology Proficiency** | High. Expert in R, Python, SPSS, GIS software, statistical analysis, research data management. |
| **Preferred Devices** | Desktop workstation, laptop, tablet |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Historical climate data (long time series), climate projections (CMIP6), reanalysis data, specialized climate indices, station data |
| **Typical Workflows** | Research question → data acquisition → analysis → publication → dissemination |
| **Permissions Required** | Data access (full archive), data download, knowledge hub contribution, collaboration space access |
| **Features Frequently Used** | Data catalogue, data download, GIS mapping, analytics, knowledge hub, collaboration workspaces |
| **Success Criteria** | Research data acquisition time reduced by 50%; publications using ClimateX data increase; research findings inform operational products. |
| **Representative User Story** | "As a University Researcher, I want a single platform where I can discover, access, and download high-quality climate data for my research, so that I can spend more time on analysis and less on data acquisition." |

### 4.12 Persona E12 — Student

| Field | Detail |
|---|---|
| **Persona ID** | E12 |
| **Name** | Kevin Otieno |
| **Role** | MSc Student — Climate Science |
| **Organization Type** | Public University |
| **Background** | Kevin is a 25-year-old MSc student in Climate Science. He is working on his thesis on seasonal forecast skill assessment. He is digitally native and eager to use modern tools. |
| **Responsibilities** | Coursework completion; thesis research; data analysis; academic presentations. |
| **Daily Activities** | Attends lectures; works on thesis; analyses climate data; writes thesis chapters; meets with supervisor; prepares seminar presentations. |
| **Goals** | Complete MSc degree with distinction; develop practical data analysis skills; publish first research paper. |
| **Motivations** | Academic achievement; career development; contribution to climate science in Africa. |
| **Pain Points** | Difficulty accessing quality climate data; learning curve for climate analysis tools; limited guidance on data sources; no centralized platform for learning resources. |
| **Challenges** | Limited computational resources; balancing coursework and research; developing programming skills; accessing supervisor time. |
| **Technology Proficiency** | High. Comfortable with Python, basic Linux, Google Earth Engine, Jupyter notebooks. Learning GIS and climate analysis tools. |
| **Preferred Devices** | Laptop (primary), smartphone, tablet |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Historical climate data, reanalysis data, satellite data, climate indices, tutorial datasets |
| **Typical Workflows** | Learning → data exploration → analysis → writing → presentation → revision |
| **Permissions Required** | Public data access, knowledge hub access (learning resources) |
| **Features Frequently Used** | Data catalogue (public), knowledge hub (learning resources), GIS mapping (basic) |
| **Success Criteria** | Can complete thesis research using ClimateX data; acquires practical skills for climate analysis career; builds professional network through platform. |
| **Representative User Story** | "As a Student, I want easy access to climate data and learning resources on a single platform, so that I can focus on my research and develop practical climate analysis skills." |

### 4.13 Persona E13 — Journalist

| Field | Detail |
|---|---|
| **Persona ID** | E13 |
| **Name** | Amina Mohamed |
| **Role** | Environment Journalist |
| **Organization Type** | National News Agency |
| **Background** | Amina is a 34-year-old journalist with 10 years of experience covering environmental and climate issues. She writes for a national newspaper and produces radio segments on climate. |
| **Responsibilities** | Report on climate and weather stories; translate complex climate information for public; fact-check climate claims; produce multimedia content. |
| **Daily Activities** | Pitches story ideas; researches climate topics; interviews experts; writes articles; produces radio segments; monitors social media for climate discussions; attends press briefings. |
| **Goals** | Report accurately and compellingly on climate issues; increase public understanding of climate change; hold decision-makers accountable. |
| **Motivations** | Public education; journalistic integrity; impact on public discourse. |
| **Pain Points** | Difficulty accessing authoritative climate data; technical reports are hard to translate for general audiences; NMHS press releases are irregular; lack of visualization tools for stories. |
| **Challenges** | Tight deadlines; simplifying complex science without misrepresenting; combating misinformation; maintaining editorial independence. |
| **Technology Proficiency** | Medium. Proficient in content management systems, social media, basic data visualization, audio/video editing. |
| **Preferred Devices** | Laptop, smartphone (primary), tablet |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Press releases, authoritative climate data for fact-checking, infographics and visualizations, expert contacts, climate summaries |
| **Typical Workflows** | Story idea → research → interview → writing → fact-check → publication → audience engagement |
| **Permissions Required** | Public portal access, media content access |
| **Features Frequently Used** | Public portal, knowledge hub, product catalogue (public), GIS mapping (for visuals) |
| **Success Criteria** | Stories are factually accurate and cite ClimateX data; public engagement with climate stories increases; misinformation is effectively countered. |
| **Representative User Story** | "As a Journalist, I want easy access to authoritative climate data, visualizations, and expert contacts, so that I can report accurately and compellingly on climate issues under tight deadlines." |

### 4.14 Persona E14 — General Public User

| Field | Detail |
|---|---|
| **Persona ID** | E14 |
| **Name** | Mary Waithera |
| **Role** | General Public User |
| **Organization Type** | N/A (Individual citizen) |
| **Background** | Mary is a 32-year-old urban resident who uses weather and climate information for daily planning and general awareness. She accesses the internet primarily through her smartphone. |
| **Responsibilities** | Personal and family planning; daily commute; community activities. |
| **Daily Activities** | Checks weather forecast in the morning; plans commute; coordinates family activities; follows climate news. |
| **Goals** | Get reliable, simple weather information for daily planning; understand how climate change may affect her community. |
| **Motivations** | Convenience; safety; general awareness. |
| **Pain Points** | Weather apps provide generic information; forecasts from different sources conflict; no local language support; limited understanding of probabilistic forecasts. |
| **Challenges** | Information overload from multiple sources; distinguishing authoritative from unreliable sources. |
| **Technology Proficiency** | Medium. Comfortable with smartphone apps, social media, web browsing. |
| **Preferred Devices** | Smartphone (primary), laptop |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Daily weather forecast, 7-day forecast, severe weather alerts, basic climate information |
| **Typical Workflows** | Check weather → plan day → receive alerts if issued → follow climate stories |
| **Permissions Required** | None (public user) |
| **Features Frequently Used** | Public portal (mobile), public weather products |
| **Success Criteria** | Forecast is accurate and useful; alerts are received in time; platform is easy to use on mobile. |
| **Representative User Story** | "As a General Public User, I want a simple, mobile-friendly weather app that gives me accurate forecasts and timely alerts in my language, so that I can plan my daily activities and stay safe during severe weather." |

### 4.15 Persona E15 — International Partner

| Field | Detail |
|---|---|
| **Persona ID** | E15 |
| **Name** | Dr. Helena Bergström |
| **Role** | Climate Programme Officer |
| **Organization Type** | International Development Agency |
| **Background** | Helena is a 46-year-old climate programme officer with 18 years of experience in international development. She manages climate resilience projects across multiple countries in East Africa. |
| **Responsibilities** | Programme management; technical oversight; monitoring and evaluation; partner coordination; reporting to headquarters. |
| **Daily Activities** | Reviews project reports; coordinates with country partners; monitors programme progress; conducts field visits; prepares programme updates; participates in sector coordination meetings. |
| **Goals** | Ensure effective delivery of climate programmes; demonstrate measurable impact; build partner capacity. |
| **Motivations** | International development; climate resilience; partnership effectiveness. |
| **Pain Points** | Difficulty accessing consistent climate data across countries; partner reporting is inconsistent; limited visibility into partner activities; no common platform for programme monitoring. |
| **Challenges** | Coordinating across multiple countries and partners; aligning diverse stakeholder interests; ensuring programme sustainability; measuring long-term impact. |
| **Technology Proficiency** | Medium-High. Proficient in office applications, project management tools, data analysis basics. |
| **Preferred Devices** | Laptop, tablet, smartphone |
| **Accessibility Considerations** | None |
| **Climate Information Needs** | Regional climate summaries, country-level climate data, project impact indicators, partner reports |
| **Typical Workflows** | Programme review → partner coordination → field monitoring → reporting → planning → evaluation |
| **Permissions Required** | Regional product access, collaboration space access, partner data access |
| **Features Frequently Used** | Climate products (regional), collaboration workspaces, analytics (programme metrics), reporting |
| **Success Criteria** | Programme decisions are informed by climate data; partner reporting is standardized and timely; programme impact is measurable and visible. |
| **Representative User Story** | "As an International Partner, I want a common platform where I can access regional climate information, collaborate with partners, and monitor programme progress, so that I can effectively manage climate resilience investments." |

---

## 5. Organizational Personas

### 5.1 Organization O01 — National Meteorological Service (NMHS)

| Field | Detail |
|---|---|
| **Organization ID** | O01 |
| **Name** | National Meteorological and Hydrological Service |
| **Type** | Government Agency |
| **Size** | 50–500 staff |
| **Mandate** | Provision of meteorological, climatological, and hydrological services. Authoritative source of weather and climate information for the nation. |
| **Objectives** | Protect life and property through accurate forecasts and warnings; support national development with climate information; meet international obligations under WMO; build climate resilience. |
| **Collaboration Needs** | Share data and products with sectoral ministries; collaborate with regional climate centres; participate in global observation and data exchange networks; partner with research institutions. |
| **Data Requirements** | Full observation data (SYNOP, METAR, upper air); satellite and radar data; global and regional NWP model outputs; historical climate data; climate projections. |
| **Security Considerations** | High. Products are authoritative and must be protected from unauthorized modification. Some data may be security-sensitive. Full encryption, access control, and audit logging required. |
| **Typical Use Cases** | Operational forecasting; climate monitoring; early warning; sector-specific product generation; research and development; international reporting. |

### 5.2 Organization O02 — Regional Climate Centre (RCC)

| Field | Detail |
|---|---|
| **Organization ID** | O02 |
| **Name** | Regional Climate Centre (e.g., ICPAC, IGAD, SADC) |
| **Type** | Intergovernmental Organization |
| **Size** | 20–100 staff |
| **Mandate** | Coordinate climate services across member countries; produce regional climate outlooks; build capacity of NMHSs; provide regional data and products. |
| **Objectives** | Strengthen regional climate services; harmonize methodologies across countries; produce authoritative regional products; facilitate data and knowledge sharing. |
| **Collaboration Needs** | Receive data from NMHSs; provide regional products to NMHSs; collaborate with global producing centres; coordinate with humanitarian organizations. |
| **Data Requirements** | Aggregated data from member countries; regional model outputs; satellite data (regional coverage); socio-economic data for impact assessment. |
| **Security Considerations** | Medium-High. Data from multiple countries requires careful access control. Regional products must be consistent and authoritative. |
| **Typical Use Cases** | Regional climate outlook forums; seasonal forecasting; regional monitoring; capacity building; emergency response coordination. |

### 5.3 Organization O03 — Government Ministry

| Field | Detail |
|---|---|
| **Organization ID** | O03 |
| **Name** | Sector Ministry (Agriculture, Water, Health, Energy, etc.) |
| **Type** | Government Ministry |
| **Size** | 100–10,000+ staff |
| **Mandate** | Sector policy development, regulation, and service delivery. Climate information supports planning and decision-making. |
| **Objectives** | Integrate climate information into sector plans; improve sector resilience; meet climate-related SDG targets; coordinate with NMHS on climate services. |
| **Collaboration Needs** | Regular climate information from NMHS; coordination on early warning; joint planning for climate adaptation; data sharing for sector analysis. |
| **Data Requirements** | Sector-specific climate products; impact-based forecasts; seasonal outlooks; climate projections for infrastructure planning; economic analysis of climate impacts. |
| **Security Considerations** | Medium. Sensitive sector data (health, water) requires protection. Access control per ministry and department. |
| **Typical Use Cases** | Policy development; sector planning; budget allocation; early warning; emergency response; reporting on climate-related indicators. |

### 5.4 Organization O04 — University

| Field | Detail |
|---|---|
| **Organization ID** | O04 |
| **Name** | Public or Private University |
| **Type** | Academic Institution |
| **Size** | 5,000–50,000+ students, 500–5,000 faculty |
| **Mandate** | Higher education and research. Climate science teaching and research contribute to national capacity. |
| **Objectives** | Train next-generation climate professionals; conduct relevant research; contribute to climate science; collaborate with operational agencies. |
| **Collaboration Needs** | Access operational data for research; collaborate with NMHS on joint research; provide research findings to inform operations; student internship opportunities. |
| **Data Requirements** | Historical climate data (long time series); climate projections; research datasets; educational datasets for teaching. |
| **Security Considerations** | Low-Medium. Research data sharing requires attribution and citation mechanisms. |
| **Typical Use Cases** | Teaching; student research; faculty research; collaborative research projects; thesis and dissertation work. |

### 5.5 Organization O05 — NGO

| Field | Detail |
|---|---|
| **Organization ID** | O05 |
| **Name** | National or International NGO |
| **Type** | Non-Governmental Organization |
| **Size** | 10–500+ staff |
| **Mandate** | Community development, humanitarian response, advocacy. Climate information is critical for programme design and implementation. |
| **Objectives** | Build community resilience; deliver climate adaptation programmes; respond to climate emergencies; advocate for climate action. |
| **Collaboration Needs** | Climate information from NMHS; coordination with government agencies; community-level feedback to service providers; partnerships with research institutions. |
| **Data Requirements** | Localized climate forecasts; impact-based information; early warning alerts; climate projections for project design; community-level data. |
| **Security Considerations** | Low-Medium. Beneficiary data protection is important. |
| **Typical Use Cases** | Project design; community early warning; adaptation programme implementation; humanitarian response; advocacy and awareness. |

### 5.6 Organization O06 — Research Institute

| Field | Detail |
|---|---|
| **Organization ID** | O06 |
| **Name** | National or International Research Institute |
| **Type** | Research Organization |
| **Size** | 50–500+ researchers |
| **Mandate** | Advanced research on climate and related disciplines. Develop new knowledge, methods, and tools for climate services. |
| **Objectives** | Advance climate science; develop innovative methods; translate research into operational applications; build scientific capacity. |
| **Collaboration Needs** | Access to operational data and products; collaboration with NMHS on applied research; partnerships with international research programmes; contribution to IPCC and other assessments. |
| **Data Requirements** | High-resolution climate data; model outputs; specialized observation datasets; computational resources for modelling. |
| **Security Considerations** | Low. Research data is generally open. Attribution and citation are important. |
| **Typical Use Cases** | Climate modelling; impact assessment; method development; applied research; capacity building. |

### 5.7 Organization O07 — Humanitarian Organization

| Field | Detail |
|---|---|
| **Organization ID** | O07 |
| **Name** | Humanitarian Organization (WFP, Red Cross, etc.) |
| **Type** | International Humanitarian Agency |
| **Size** | 100–10,000+ staff |
| **Mandate** | Humanitarian assistance, emergency response, food security. Climate information enables anticipatory action and effective response. |
| **Objectives** | Anticipate humanitarian crises; preposition resources; respond effectively to emergencies; build community resilience; coordinate with national authorities. |
| **Collaboration Needs** | Real-time early warning information; impact-based forecasts; coordination with NMHS and disaster management; data sharing for needs assessment. |
| **Data Requirements** | Early warning alerts; impact-based forecasts; food security indicators; population data; infrastructure data for logistics planning. |
| **Security Considerations** | Medium. Operational security during emergencies. Beneficiary data protection. |
| **Typical Use Cases** | Emergency preparedness; anticipatory action; disaster response; food security monitoring; logistics planning. |

### 5.8 Organization O08 — Private Company

| Field | Detail |
|---|---|
| **Organization ID** | O08 |
| **Name** | Private Sector Company (Insurance, Agriculture, Energy, etc.) |
| **Type** | Private Enterprise |
| **Size** | 10–10,000+ employees |
| **Mandate** | Profit through products and services. Climate information supports risk management, operations, and value-added services. |
| **Objectives** | Use climate information for competitive advantage; develop climate-resilient business models; offer climate-informed products and services; meet regulatory requirements. |
| **Collaboration Needs** | Reliable climate data and products; API access for integration; partnership opportunities with NMHS; sector-specific products. |
| **Data Requirements** | Historical data for risk assessment; seasonal forecasts for planning; real-time data for operations; sector-specific indices. |
| **Security Considerations** | Medium-High. Commercial sensitivity of business data. Compliance with data licensing. |
| **Typical Use Cases** | Insurance risk assessment; agricultural advisory services; energy trading; logistics planning; commodity trading. |

### 5.9 Organization O09 — International Agency

| Field | Detail |
|---|---|
| **Organization ID** | O09 |
| **Name** | International Agency (WMO, UNDP, World Bank, etc.) |
| **Type** | Intergovernmental or Multilateral Organization |
| **Size** | 500–10,000+ staff |
| **Mandate** | Global governance, standard setting, development finance, technical assistance. Provides oversight, standards, and resources for climate services. |
| **Objectives** | Strengthen global climate services infrastructure; set standards and best practices; provide development financing; monitor global climate action. |
| **Collaboration Needs** | Receive data and reports from NMHSs; provide technical guidance; coordinate across countries; monitor global climate indicators. |
| **Data Requirements** | Aggregated national and regional data; compliance reports; impact assessments; financial data. |
| **Security Considerations** | High. Some data may be sensitive. Compliance with international data governance frameworks. |
| **Typical Use Cases** | Standard setting; programme oversight; technical assistance; monitoring and evaluation; global reporting. |

---

## 6. User Goals

### 6.1 Goal Categories

User goals for ClimateX are organized into seven categories reflecting the different motivations and outcome expectations across the persona landscape.

### 6.2 Operational Goals

Goals related to day-to-day tasks and routine operations.

| Goal ID | Goal | Relevant Personas |
|---|---|---|
| G-OP01 | Produce accurate climate products on schedule | P01, P03, P04 |
| G-OP02 | Monitor data quality and system health in real time | P05, P09 |
| G-OP03 | Process and fulfil climate requests efficiently | P06, P01 |
| G-OP04 | Manage user accounts and access permissions | P07 |
| G-OP05 | Disseminate products through multiple channels reliably | P11, P03 |
| G-OP06 | Review and approve products before publication | P12 |
| G-OP07 | Execute test cases and verify quality | P13 |

### 6.3 Strategic Goals

Goals related to long-term organizational direction and improvement.

| Goal ID | Goal | Relevant Personas |
|---|---|---|
| G-ST01 | Improve forecast skill and product quality year-on-year | P01, P05, P08 |
| G-ST02 | Increase user adoption and satisfaction | P06, P08, P11 |
| G-ST03 | Secure sustainable funding and partnerships | P08 |
| G-ST04 | Build organizational reputation and influence | P08, P02 |
| G-ST05 | Demonstrate impact to stakeholders and funders | P08, P05 |
| G-ST06 | Mainstream climate information in national planning | E09, E10 |

### 6.4 Research Goals

Goals related to scientific inquiry and knowledge generation.

| Goal ID | Goal | Relevant Personas |
|---|---|---|
| G-RS01 | Access high-quality climate data for research | P02, E11 |
| G-RS02 | Validate and improve forecast methods | P01, P02 |
| G-RS03 | Publish research findings | P02, E11 |
| G-RS04 | Train and mentor next-generation scientists | P02, E11, E12 |
| G-RS05 | Develop and test innovative AI methods | P10 |

### 6.5 Decision Support Goals

Goals related to using climate information for decision-making.

| Goal ID | Goal | Relevant Personas |
|---|---|---|
| G-DS01 | Make informed agricultural decisions | E01 |
| G-DS02 | Allocate water resources optimally | E02 |
| G-DS03 | Plan emergency response effectively | E03 |
| G-DS04 | Issue timely health advisories | E04 |
| G-DS05 | Plan energy supply and grid operations | E05 |
| G-DS06 | Ensure aviation and marine safety | E06, E07 |
| G-DS07 | Design evidence-based development programmes | E08, E15 |

### 6.6 Communication Goals

Goals related to information sharing and public engagement.

| Goal ID | Goal | Relevant Personas |
|---|---|---|
| G-CM01 | Communicate accurate climate information to the public | P11, E13 |
| G-CM02 | Translate complex products for non-specialist audiences | P06, P11, E13 |
| G-CM03 | Issue timely warnings during emergencies | P03, P11, E03 |
| G-CM04 | Build public trust in climate information | P11, P08 |
| G-CM05 | Combat misinformation with authoritative information | E13, P11 |

### 6.7 Emergency Response Goals

Goals related to preparedness and response to extreme events.

| Goal ID | Goal | Relevant Personas |
|---|---|---|
| G-ER01 | Receive timely early warning alerts | E01, E02, E03, E04, E07 |
| G-ER02 | Coordinate multi-agency emergency response | E03, O07 |
| G-ER03 | Mobilize anticipatory action before disasters | O07, E03 |
| G-ER04 | Communicate warnings to last-mile communities | P03, P11, E03, E08 |
| G-ER05 | Assess and communicate disaster impacts | E03, P05 |

### 6.8 Collaboration Goals

Goals related to working together across organizations and roles.

| Goal ID | Goal | Relevant Personas |
|---|---|---|
| G-CL01 | Collaborate on product development and review | P01, P12, P06 |
| G-CL02 | Share data and knowledge across organizations | P02, E11, O01–O09 |
| G-CL03 | Coordinate between NMHS and sectoral users | P06, E02–E10 |
| G-CL04 | Participate in joint research projects | P02, E11, O04, O06 |
| G-CL05 | Coordinate across multiple agencies during emergencies | E03, O01, O07 |

---

## 7. User Journey Maps

### 7.1 Journey Map — Climate Forecaster (P01)

**Scenario**: Dr. Amara Osei needs to produce the monthly seasonal outlook and disseminate it to sectoral users.

| Stage | Actions | Touchpoints | Emotions | Pain Points | Opportunities |
|---|---|---|---|---|---|
| **Discover** | Opens ClimateX; navigates to forecast workspace | Dashboard, navigation menu | Neutral → Frustrated | Portal loads slowly; too many clicks to reach workspace | Streamline navigation to forecast workspace; save as default |
| **Acquire Data** | Reviews available data; imports GFS, ECMWF, CHIRPS; checks data quality | Data catalogue, data integration | Frustrated | Manual selection of data sources; data quality not visible upfront; slow ingestion | Auto-ingest based on forecast type; show data quality indicators; background ingestion |
| **Analyse** | Runs statistical models; reviews ensemble outputs; assesses forecast skill | Analytics tools, model outputs | Engaged | Model outputs in different formats; limited visualization options | Unified analysis workspace; interactive visualization; AI-assisted pattern detection |
| **Generate Product** | Creates seasonal outlook map; writes narrative; generates bulletin | Product generation templates | Focused | Template customization is limited; map styling is manual; narrative sections are repetitive | Smart templates with auto-population; AI-assisted narrative generation; customizable map styles |
| **Review** | Submits for peer review; receives feedback; revises | Review workflow | Anxious | Review turnaround is slow; feedback is not structured | Structured review interface; in-line comments; automated quality checks |
| **Approve** | Final approval from reviewer | Approval workflow | Satisfied | Approval notification is easy to miss; no SLA tracking | Push notification for approvals; SLA dashboard for review times |
| **Disseminate** | Publishes product; selects dissemination channels; sends notifications | Dissemination manager | Accomplished | Channels are selected manually; no audience targeting; no scheduling | Automated channel selection based on product type; audience segmentation; scheduled publication |
| **Verify** | Reviews forecast skill after verification period | Forecast verification | Curious | Verification is manual; skill scores not automatically computed | Automated verification against observations; skill score dashboards |
| **Reflect** | Documents lessons learned; updates forecast methods | Knowledge hub | Reflective | No structured lesson-learning process | Integrated feedback loop; AI-suggested method improvements |

### 7.2 Journey Map — Farmer (E01)

**Scenario**: Joseph Lekishon needs to decide when to plant his maize based on the seasonal forecast.

| Stage | Actions | Touchpoints | Emotions | Pain Points | Opportunities |
|---|---|---|---|---|---|
| **Discover** | Hears about climate service from cooperative; receives SMS promo | SMS, community meeting | Curious → Skeptical | Has received unreliable info before; doesn't know what to expect | Community ambassador programme; trusted messenger approach |
| **Subscribe** | Registers via SMS with basic phone | SMS interface | Frustrated | Registration process is complex; language barrier | Simple keyword-based SMS registration; local language support |
| **Receive** | Receives seasonal forecast SMS in local language | SMS | Hopeful | Message is still too technical; doesn't fully understand "probability" | Plain language; concrete action guidance; voice message option |
| **Interpret** | Discusses with cooperative extension officer | Extension officer, cooperative meeting | Engaged | Extension officer is not always available | Peer learning groups; community radio discussion |
| **Decide** | Decides to plant early based on forecast and cooperative advice | Mental decision | Anxious | Risk-averse; worried about being wrong if forecast is inaccurate | Seasonal forecast confidence indicators; success stories from other farmers |
| **Act** | Plants maize; monitors weather | Physical action | Hopeful | No way to get updates if forecast changes | Follow-up SMS updates; two-way feedback channel |
| **Observe** | Watches rainfall; compares with forecast | Personal observation | Curious | No systematic way to report observations | Two-way SMS for farmer observations; participatory monitoring |
| **Feedback** | Reports outcome to cooperative; receives next forecast | Cooperative meeting, SMS | Satisfied (if good) / Disappointed (if poor) | Feedback doesn't seem to improve forecasts | Farmer feedback improves forecast verification; closing the loop |

### 7.3 Journey Map — Disaster Risk Manager (E03)

**Scenario**: Colonel James Barasa receives a heavy rainfall warning and must coordinate response.

| Stage | Actions | Touchpoints | Emotions | Pain Points | Opportunities |
|---|---|---|---|---|---|
| **Monitor** | Checks ClimateX early warning dashboard | Dashboard, mobile alert | Neutral → Alert | Dashboard loads slowly; multiple systems to check | Unified early warning dashboard with live updates |
| **Alert** | Receives heavy rainfall warning with impact forecast | Push notification, SMS | Concerned | Warning doesn't specify which areas are most at risk; text is technical | Impact-based warnings with GIS mapping; plain language |
| **Assess** | Opens GIS map; overlays hazard, exposure, vulnerability layers | GIS mapping | Focused | Layers load slowly; not all data available (e.g., population density) | Pre-configured hazard assessment views; cached critical layers |
| **Coordinate** | Schedules emergency coordination meeting; shares map and assessment | Collaboration workspace | Organized | Manual meeting scheduling; sharing maps via email | Integrated coordination workspace; real-time map sharing |
| **Decide** | Makes evacuation decision based on warning and assessment | Decision support | Anxious | High-consequence decision; wants to avoid both false alarm and missed event | Decision support checklist; historical verification of similar events |
| **Respond** | Activates response plan; deploys resources; issues public alert | Dissemination, field communications | Urgent | Alert dissemination is slow; some channels don't reach remote areas | Multi-channel alert dissemination; pre-configured alert templates |
| **Monitor** | Tracks rainfall in real time; updates situation assessment | Dashboard, field reports | Engaged | Field reports are manual; no real-time rainfall data integration | Real-time rainfall integration; mobile field reporting |
| **Report** | Prepares situation report; briefs senior officials | Reporting tools | Exhausted | Report preparation is manual; data from multiple sources | Auto-generated situation reports; template-based briefings |
| **Review** | Conducts post-event review; documents lessons | Knowledge hub | Reflective | Lessons are not systematically captured | Structured after-action review; lessons database searchable |

---

## 8. User Stories

### 8.1 User Story Format

All user stories follow the standard format:

> **As a** [persona], **I want** [goal/feature], **so that** [benefit].

Each story includes acceptance criteria that define when the story is complete.

### 8.2 Core Platform User Stories

| Story ID | User Story | Acceptance Criteria |
|---|---|---|
| US-001 | As a **Climate Forecaster (P01)**, I want to automatically ingest data from multiple global models in a unified workflow, so that I spend less time on data preparation and more on analysis. | AC1: One-click data import from GFS, ECMWF, ICON. AC2: Data format standardization is automatic. AC3: Ingestion status is visible. AC4: Failed ingestion alerts are sent. |
| US-002 | As a **GIS Specialist (P04)**, I want a self-service map creation tool for non-GIS users, so that I can focus on complex spatial analysis instead of producing routine maps. | AC1: Template-based map generation with drag-and-drop layers. AC2: Pre-set map styles aligned with WMO standards. AC3: Output formats include PNG, PDF, GeoPDF. AC4: GIS Specialist can create and manage templates. |
| US-003 | As a **Platform Administrator (P07)**, I want to manage user accounts and roles through an intuitive interface, so that I can efficiently control platform access without technical support. | AC1: User creation, activation, deactivation. AC2: Role assignment with pre-defined permission sets. AC3: Bulk user import via CSV. AC4: Activity log for all user management actions. |
| US-004 | As an **Executive Director (P08)**, I want an executive dashboard showing organizational performance and impact metrics, so that I can make informed strategic decisions and demonstrate value to funders. | AC1: Key metrics (products generated, users served, uptime, satisfaction). AC2: Trend visualization (daily, weekly, monthly, yearly). AC3: Export to PDF for presentations. AC4: Configurable date ranges. |
| US-005 | As an **IT Administrator (P09)**, I want automated infrastructure monitoring and alerting, so that I can maintain high availability and respond to issues before users are affected. | AC1: CPU, memory, disk, network monitoring. AC2: Service health check dashboard. AC3: Automated alerts via email and SMS. AC4: Historical trend data for capacity planning. |
| US-006 | As a **Quality Assurance Officer (P13)**, I want automated regression testing in the CI/CD pipeline, so that I can focus exploratory testing on new features rather than manual regression. | AC1: Test suite runs on every deployment. AC2: Test results are reported with pass/fail and trends. AC3: Failed tests block deployment. AC4: Test execution time is monitored and optimized. |

### 8.3 Climate Product User Stories

| Story ID | User Story | Acceptance Criteria |
|---|---|---|
| US-007 | As a **Climate Forecaster (P01)**, I want to generate seasonal outlooks using templates that auto-populate with latest data, so that product creation is faster and more consistent. | AC1: Template selection based on product type. AC2: Charts and maps auto-populate with latest data. AC3: Narrative sections have AI-assisted drafting. AC4: Product preview before finalization. |
| US-008 | As a **Product Reviewer (P12)**, I want a structured review interface with quality checklists and reference data, so that I can conduct thorough reviews efficiently. | AC1: Side-by-side product and reference data view. AC2: Quality checklist per product type. AC3: In-line comments and annotations. AC4: Approve/reject with feedback. |
| US-009 | As a **Climate Services Officer (P06)**, I want to customize climate products for different sectors and languages, so that each user community receives relevant and understandable information. | AC1: Sector-specific templates (agriculture, water, health, energy). AC2: Language selection and translation support. AC3: Customizable content sections. AC4: Version tracking for customized products. |
| US-010 | As a **Meteorologist (P03)**, I want to issue impact-based warnings with GIS hazard mapping, so that warnings are actionable and targeted to communities at risk. | AC1: Warning creation with impact level selection. AC2: GIS integration for hazard zone mapping. AC3: Pre-configured warning templates. AC4: Multi-channel alert dissemination with one action. |

### 8.4 Data and Analytics User Stories

| Story ID | User Story | Acceptance Criteria |
|---|---|---|
| US-011 | As a **Data Analyst (P05)**, I want automated data quality monitoring with alerting, so that I can identify and resolve data issues before they affect products. | AC1: Automated quality checks on all ingested data. AC2: Quality score per data source. AC3: Alerting when quality thresholds are breached. AC4: Quality trend dashboard. |
| US-012 | As a **Climate Scientist (P02)**, I want to access full historical climate archives through a single platform, so that I can focus on research instead of data collection. | AC1: Data catalogue with search and filter. AC2: Download in multiple formats (NetCDF, CSV, GeoJSON). AC3: Metadata and citation information. AC4: API access for programmatic data retrieval. |
| US-013 | As a **University Researcher (E11)**, I want to download climate data in standard formats with complete metadata, so that I can use it in my research without reformatting. | AC1: Data format options (NetCDF, CSV, GRIB, GeoTIFF). AC2: Complete ISO 19115 metadata. AC3: Data citation generator. AC4: Large dataset subsetting before download. |
| US-014 | As a **Student (E12)**, I want access to learning resources and tutorial datasets on the platform, so that I can develop practical skills in climate analysis. | AC1: Tutorial section with example datasets. AC2: Jupyter notebook examples. AC3: Learning pathway recommendations. AC4: Self-assessment quizzes. |

### 8.5 Dissemination and Communication User Stories

| Story ID | User Story | Acceptance Criteria |
|---|---|---|
| US-015 | As a **Communications Officer (P11)**, I want to publish products across multiple channels from one interface, so that I can communicate quickly and consistently. | AC1: Channel selection (web, email, SMS, social media, WhatsApp). AC2: Content adaptation per channel. AC3: Approval workflow before publication. AC4: Publication scheduling. |
| US-016 | As a **Farmer (E01)**, I want to receive weather and climate information in my local language via SMS, so that I can make better farming decisions. | AC1: SMS in local language. AC2: Plain language with concrete action guidance. AC3: Message frequency preferences. AC4: Two-way feedback via SMS. |
| US-017 | As a **Journalist (E13)**, I want access to authoritative climate data and visualizations, so that I can report accurately under tight deadlines. | AC1: Public portal with product catalogue. AC2: Downloadable infographics and visualizations. AC3: Expert contact directory. AC4: Press release section. |

### 8.6 Collaboration User Stories

| Story ID | User Story | Acceptance Criteria |
|---|---|---|
| US-018 | As a **Climate Services Officer (P06)**, I want to collaborate with sectoral users on product customization, so that products meet specific user needs. | AC1: Shared workspace for product development. AC2: Comments and feedback on draft products. AC3: Version history with change tracking. AC4: Notification of updates and mentions. |
| US-019 | As a **Disaster Risk Manager (E03)**, I want a shared coordination workspace with NMHS and response agencies, so that we can coordinate effectively during emergencies. | AC1: Real-time situation board. AC2: Shared map with hazard layers. AC3: Task assignment and tracking. AC4: Secure messaging. |
| US-020 | As an **NGO Representative (E08)**, I want to collaborate with NMHS on climate service design for communities, so that services are relevant and accessible. | AC1: Project workspace with NMHS partners. AC2: Document sharing and version control. AC3: Community feedback integration. AC4: Joint activity tracking. |

### 8.7 Administration and Security User Stories

| Story ID | User Story | Acceptance Criteria |
|---|---|---|
| US-021 | As an **Administrator (P07)**, I want to configure role-based permissions for all platform modules, so that users have appropriate access levels. | AC1: Role creation and editing. AC2: Permission assignment per module and action. AC3: Role hierarchy with inheritance. AC4: Permission audit and reporting. |
| US-022 | As an **IT Administrator (P09)**, I want to view and export audit logs for all security-relevant events, so that I can support security investigations. | AC1: Audit log with search and filter. AC2: Log export (CSV, JSON). AC3: Configurable retention period. AC4: Log integrity verification. |
| US-023 | As an **AI Analyst (P10)**, I want a standardized MLOps pipeline for model training and deployment, so that I can iterate rapidly while maintaining quality. | AC1: Model training pipeline with version tracking. AC2: Automated model evaluation against benchmarks. AC3: Canary deployment for new models. AC4: Model performance monitoring dashboard. |

---

## 9. Role & Permission Matrix

### 9.1 Platform Roles

| Role ID | Role Name | Description | Assigned Personas |
|---|---|---|---|
| R01 | Public User | Unauthenticated user accessing public content | E01, E12, E13, E14 |
| R02 | Registered User | Authenticated user with basic access | E02–E11, E15 |
| R03 | Data Consumer | Access to climate products and data downloads | E01–E15 |
| R04 | Data Contributor | Ability to upload data and contribute content | P02, E11 |
| R05 | Product Creator | Ability to create and edit climate products | P01, P03, P04, P06 |
| R06 | Product Reviewer | Review and approve products before publication | P12 |
| R07 | Product Publisher | Final publication authority for products | P01, P03, P12 |
| R08 | AI Developer | Access to AI model training and deployment | P10 |
| R09 | Administrator | Platform configuration and user management | P07 |
| R10 | IT Administrator | Infrastructure and system administration | P09 |
| R11 | Executive | Strategic dashboard and organizational reporting | P08 |
| R12 | QA Officer | Test environment and quality management access | P13 |
| R13 | Communications | Public content and dissemination management | P11 |

### 9.2 Module Access Matrix

| Module | Public (R01) | Registered (R02) | Data Consumer (R03) | Product Creator (R05) | Reviewer (R06) | Admin (R09) | IT Admin (R10) |
|---|---|---|---|---|---|---|---|
| **Public Portal** | View | View | View | View | View | Configure | — |
| **User Profile** | — | View/Edit Own | View/Edit Own | View/Edit Own | View/Edit Own | Manage All | — |
| **Product Catalogue** | View Only | View, Search | View, Search, Download | View, Create, Edit Own | View, Review | Manage All | — |
| **Product Generation** | — | — | — | Create, Edit | Review, Approve | Configure Templates | — |
| **Climate Requests** | Submit (limited) | Submit | Submit, Track Own | Fulfil Requests | — | Manage All | — |
| **Data Catalogue** | View Metadata | View Metadata | View, Download | View, Download | View, Download | Manage All | Manage Storage |
| **GIS Mapping** | View Public Maps | View, Basic Maps | View, Create Maps | View, Create Maps | View, Review | Configure Layers | — |
| **AI Services** | Assistant (Basic) | Assistant | Assistant, Tools | AI-Assisted Creation | — | Configure | — |
| **Collaboration** | — | Participate | Create Spaces | Create Spaces | Review Workspace | Manage All | — |
| **Knowledge Hub** | View Public | View, Contribute | View, Contribute | View, Contribute | View, Contribute | Manage All | — |
| **Analytics** | Public Dashboards | Personal Dashboards | Personal Dashboards | Personal + Product | Quality Metrics | All Dashboards | System Metrics |
| **Administration** | — | — | — | — | — | Full Access | Limited |
| **Dissemination** | Receive (opt-in) | Receive (configure) | Configure Subscriptions | Manage Products | Approve | Configure Channels | — |
| **Developer Portal** | — | View Docs | API Keys (own) | — | — | Manage Keys | Manage API |

### 9.3 Action Permissions by Module

| Module | View | Create | Edit | Delete | Approve | Configure |
|---|---|---|---|---|---|---|
| Products | R01+ | R05+ | R05+ (own) | R09 | R06 | R09 |
| Data | R01+ (meta) | R04 | R04 (own) | R09 | — | R09 |
| Users | R09 | R09 | R09 | R09 | — | R09 |
| Roles | R09 | R09 | R09 | R09 | — | R09 |
| Templates | R05+ (use) | R09 | R09 | R09 | — | R09 |
| GIS Layers | R02+ (view) | R04 | R04 (own) | R09 | — | R09 |
| AI Models | R10 | R10 | R10 | R10 | — | R10 |
| Collaboration | R02+ (join) | R02+ | R02+ (own) | R02+ (own) | — | R09 |
| Dissemination | R11 | R11 | R11 | R09 | R12 | R09 |

---

## 10. Communication Preferences

### 10.1 Communication Channel Matrix

| Persona | Email | SMS | WhatsApp | Push Notif. | In-App | Reports | API | Dashboard |
|---|---|---|---|---|---|---|---|---|
| **P01 — Forecaster** | Daily digest | Critical alerts | Team chat | Product updates | All activity | Weekly verification | Data ingestion | Forecast tools |
| **P02 — Scientist** | Research alerts | — | Collaborator chat | — | Knowledge updates | Quarterly data | Data download | Research analytics |
| **P03 — Meteorologist** | Shift reports | Warning alerts | Team coordination | Warning issuance | Nowcasting updates | Daily summary | Observation data | Real-time monitoring |
| **P04 — GIS Specialist** | Task notifications | — | — | Map updates | Layer updates | Monthly usage | WMS/WFS | GIS tools |
| **P05 — Data Analyst** | Quality alerts | Critical alerts | — | — | Dashboard updates | Weekly quality | ETL pipeline | Data quality |
| **P06 — Services Officer** | User inquiries | User alerts | Partner chat | Feedback alerts | User activity | Monthly engagement | — | User analytics |
| **P07 — Administrator** | Daily summary | Critical issues | Admin team | User requests | All activity | Weekly operations | — | Admin dashboard |
| **P08 — Executive** | Weekly brief | — | — | — | Strategic updates | Monthly executive | — | Executive dashboard |
| **P09 — IT Admin** | Incident reports | Critical alerts | Ops team | System alerts | All activity | Weekly infra | System health | Infrastructure |
| **P10 — AI Analyst** | Model alerts | — | — | — | Model metrics | Monthly model | Training pipeline | Model monitoring |
| **P11 — Comms Officer** | Content approval | Media alerts | Media chat | Publication alerts | Content queue | Monthly reach | — | Comms analytics |
| **P12 — Reviewer** | Review requests | — | Review team | — | Pending reviews | Weekly quality | — | Quality metrics |
| **P13 — QA Officer** | Build reports | Critical bugs | QA team | Test results | All activity | Release report | Test pipeline | Test dashboard |
| **E01 — Farmer** | — | Primary channel | Alternative | — | — | — | — | — |
| **E02 — Water Manager** | Weekly updates | Critical alerts | — | — | Data updates | Monthly water | Data download | Water dashboard |
| **E03 — Disaster Mgr** | Situation reports | Primary channel | Coordination | — | — | — | Warning data | Early warning dashboard |
| **E04 — Health Officer** | Weekly updates | Outbreak alerts | Partner chat | — | — | Monthly health | — | Health risk dashboard |
| **E05 — Energy Planner** | Weekly updates | Grid alerts | — | — | — | Quarterly energy | Data download | Energy dashboard |
| **E06 — Aviation** | Shift briefings | Hazard alerts | — | — | — | — | AVIATION data | Aviation dashboard |
| **E07 — Marine** | Daily forecast | Gale alerts | — | — | — | — | Marine data | Marine dashboard |
| **E08 — NGO Rep** | Project updates | Field alerts | Partner chat | Programme alerts | Collaboration | Quarterly project | — | Programme dashboard |
| **E09 — County Officer** | Weekly advisories | Alert forwarding | Extension chat | — | — | Monthly county | — | County dashboard |
| **E10 — Gov't Officer** | Policy briefs | — | — | — | — | Quarterly policy | — | National dashboard |
| **E11 — Researcher** | Data availability | — | Research chat | — | Collaboration | Annual research | Data API | Research tools |
| **E12 — Student** | Learning updates | — | Study group | Assignment alerts | — | — | — | Learning dashboard |
| **E13 — Journalist** | Press releases | Breaking news | Media group | News alerts | — | — | — | Media dashboard |
| **E14 — Public User** | Newsletters | Alerts (opt-in) | Public channel | Alerts | — | — | — | — |
| **E15 — Int'l Partner** | Programme updates | Emergency alerts | Partner chat | — | Collaboration | Quarterly programme | — | Programme dashboard |

---

## 11. Accessibility & Inclusivity

### 11.1 Accessibility Principles for ClimateX

ClimateX must be usable by people with diverse abilities, technical literacy levels, language backgrounds, and connectivity environments. The platform's accessibility strategy covers four dimensions:

### 11.2 Technical Accessibility

Covered in detail in Chapter 4 (NFR-057–NFR-061), the platform must:

- Comply with WCAG 2.1 Level AA (minimum)
- Support keyboard-only navigation
- Be compatible with screen readers (JAWS, NVDA, VoiceOver, TalkBack)
- Meet colour contrast requirements (4.5:1 normal text, 3:1 large text)
- Support text scaling up to 200% without loss of functionality
- Provide alternative text for all non-decorative images
- Ensure all functionality is available via keyboard

### 11.3 Language Inclusivity

| Requirement | Target | Personas Affected |
|---|---|---|
| Interface localization | Minimum 3 languages (English, French, Swahili) | E01, E08, E09, E14 |
| Product translation | AI-assisted translation to local languages | E01, E08, E09 |
| Plain language option | Reading level appropriate for general public (age 12–14 level) | E01, E14, E13 |
| Voice-based information | Audio versions of critical alerts and forecasts | E01 (low literacy) |
| Visual communication | Icons, infographics, maps alongside text | All external personas |

### 11.4 Connectivity Inclusivity

| Challenge | Solution | Personas Affected |
|---|---|---|
| Low bandwidth (< 256 Kbps) | Mobile-optimized interface; progressive web app; offline-capable features | E01, E08, E09, E14 |
| Intermittent connectivity | Offline data caching; queued actions sync when online | E01, E08, E09 |
| High data cost | Data-efficient design; SMS as primary channel; image compression | E01, E14 |
| Feature phone only | USSD/SMS interface for essential services | E01 |

### 11.5 Literacy and Digital Skills Inclusivity

| Barrier | Accommodation | Personas Affected |
|---|---|---|
| Limited literacy | Voice-based information; pictorial communication; community intermediaries | E01 |
| Low digital literacy | Simplified interfaces; guided workflows; training resources; help desk | E01, E14 |
| Limited technical vocabulary | Glossary tooltips; plain language toggle; context-sensitive help | E01, E14, E13 |
| Different learning styles | Multiple format options (text, audio, visual, interactive) | E01, E12, E14 |

### 11.6 Age and Experience Inclusivity

| Consideration | Design Approach | Personas Affected |
|---|---|---|
| Older users (50+) | Larger fonts; higher contrast; simpler navigation; reduced cognitive load | E01, E03, E09, E10 |
| Young users (18–25) | Modern UI; mobile-first; social features; learning gamification | E12 |
| Novice users | Guided onboarding; progressive feature disclosure; contextual help | E01, E12, E14 |
| Expert users | Advanced features; keyboard shortcuts; API access; customization | P01, P02, P04, P10 |

---

## 12. User Satisfaction Metrics

### 12.1 Satisfaction Measurement Framework

User satisfaction for each persona is measured through a combination of quantitative metrics and qualitative feedback.

### 12.2 Task Completion Metrics

| Persona | Key Task | Target Completion Rate | Target Time |
|---|---|---|---|
| P01 — Forecaster | Generate seasonal outlook | ≥ 90% first attempt | ≤ 20 minutes |
| P03 — Meteorologist | Issue severe weather warning | ≥ 95% first attempt | ≤ 5 minutes |
| P04 — GIS Specialist | Create standard map product | ≥ 90% first attempt | ≤ 15 minutes |
| P06 — Services Officer | Customize product for sector | ≥ 85% first attempt | ≤ 10 minutes |
| P12 — Reviewer | Complete product review | ≥ 90% within SLA | ≤ 30 minutes |
| E01 — Farmer | Receive and understand forecast | ≥ 80% comprehension | N/A |
| E03 — Disaster Mgr | Activate response based on warning | ≥ 95% | ≤ 10 minutes |

### 12.3 Time Savings Metrics

| Persona | Current Baseline | ClimateX Target | Measurement |
|---|---|---|---|
| P01 — Forecaster | 4 hrs data prep + 3 hrs product creation | 1 hr data prep + 1.5 hrs product creation | Self-reported time logs |
| P04 — GIS Specialist | 2 hrs per routine map | 30 min per routine map | System-tracked creation time |
| P05 — Data Analyst | 3 hrs/day manual quality checks | 30 min/day automated monitoring | System-tracked QA activities |
| P09 — IT Admin | 2 hrs/day manual monitoring | 15 min/day dashboard review | Incident response metrics |
| P11 — Comms Officer | 1 hr per multi-channel publication | 15 min per publication | System-tracked publication time |

### 12.4 Ease of Use Metrics

| Metric | Target | Method |
|---|---|---|
| System Usability Scale (SUS) score | ≥ 75 (out of 100) | Annual survey across all personas |
| Single Ease Question (SEQ) per key task | ≥ 5.5 (out of 7) | Post-task survey in usability testing |
| Error rate per key workflow | ≤ 5% | System monitoring of error recovery actions |
| Help desk tickets per feature | ≤ 2% of active users/month | Help desk analytics |
| Training time for new users | ≤ 2 hours for basic tasks | Training programme feedback |

### 12.5 Satisfaction Metrics

| Persona Segment | Target Satisfaction | Measurement Frequency |
|---|---|---|
| Internal users (P01–P13) | ≥ 85% satisfied | Quarterly survey |
| External professionals (E02–E11, E15) | ≥ 80% satisfied | Bi-annual survey |
| Community users (E01, E14) | ≥ 75% satisfied | Annual survey via intermediaries |
| Partner organizations (O01–O09) | ≥ 85% satisfied | Annual partner survey |
| Overall platform satisfaction | ≥ 80% | Continuous (in-app feedback) |

### 12.6 Adoption and Retention Metrics

| Metric | Year 1 Target | Year 3 Target | Year 5 Target |
|---|---|---|---|
| Registered users | 500 | 5,000 | 20,000 |
| Active monthly users (internal) | 50 | 150 | 300 |
| Active monthly users (external) | 200 | 2,000 | 10,000 |
| User retention (12-month) | 70% | 80% | 85% |
| Product downloads per month | 1,000 | 10,000 | 50,000 |
| API consumers | 5 | 50 | 200 |

### 12.7 Engagement Metrics

| Metric | Target | Method |
|---|---|---|
| Average session duration | ≥ 10 minutes (internal) | Analytics tracking |
| Features used per session | ≥ 3 (internal) | Feature usage analytics |
| Return rate (7-day) | ≥ 40% (internal) | User login analytics |
| Products created per forecaster per month | ≥ 10 | Product creation tracking |
| Collaboration interactions per user per month | ≥ 5 | Collaboration analytics |

---

## 13. Persona Traceability Matrix

### 13.1 Persona to Business Goal Mapping

| Persona | Primary Business Goals (Ch. 2) | Secondary Business Goals |
|---|---|---|
| P01 — Forecaster | GT1, GT2, GT3, GT9 | GT6, GT11 |
| P02 — Scientist | GT8, GT13 | GT9, GT11 |
| P03 — Meteorologist | GT1, GT2, GT3, GT4 | GT5, GT7 |
| P04 — GIS Specialist | GT6, GT10 | GT3, GT8 |
| P05 — Data Analyst | GT1, GT8 | GT7, GT12 |
| P06 — Services Officer | GT2, GT7, GT11 | GT3, GT4 |
| P07 — Administrator | GT1, GT5 | GT14 |
| P08 — Executive | GT1, GT5 | GT12, GT14 |
| P09 — IT Admin | GT1, GT5 | GT8 |
| P10 — AI Analyst | GT9 | GT8 |
| P11 — Comms Officer | GT4, GT14 | GT7 |
| P12 — Reviewer | GT3 | GT7 |
| P13 — QA Officer | GT1 | GT5 |
| E01 — Farmer | GT7, GT14 | GT4 |
| E02 — Water Manager | GT6, GT7 | GT10 |
| E03 — Disaster Manager | GT4, GT7 | GT6 |
| E04 — Health Officer | GT7 | GT6 |
| E05 — Energy Planner | GT7 | GT6 |
| E06 — Aviation Officer | GT4, GT7 | GT6 |
| E07 — Marine Officer | GT4, GT7 | GT6 |
| E08 — NGO Rep | GT7, GT11 | GT13 |
| E09 — County Officer | GT7, GT10 | GT6 |
| E10 — Gov't Officer | GT7, GT12 | GT6 |
| E11 — Researcher | GT8, GT13 | GT11 |
| E12 — Student | GT13, GT14 | GT8 |
| E13 — Journalist | GT14 | GT7 |
| E14 — Public User | GT14 | GT7 |
| E15 — Int'l Partner | GT5, GT7 | GT11 |

### 13.2 Persona to Module Mapping

| Module (Chapter 3) | Primary Personas | Secondary Personas |
|---|---|---|
| **Core Platform** (FR-001–009) | P07, P09, P13 | P01–P06, P08, P10–P12 |
| **Climate Request** (FR-010–022) | P06, P01 | E02–E10, E15 |
| **Product Generation** (FR-023–030) | P01, P03, P04, P06 | P12, P10 |
| **Collaboration** (FR-031–038) | P06, P01, P02 | E03, E08, E11, E15 |
| **GIS & Mapping** (FR-039–047) | P04, P01, P03 | E02, E03, E09 |
| **AI Services** (FR-048–055) | P10, P01, P06 | P02, E01–E10 |
| **Knowledge Hub** (FR-056–059) | P02, E11, E12 | P01, P06, E13 |
| **Analytics** (FR-060–064) | P05, P08 | P01, P07, P09 |
| **Dissemination** (FR-065–070) | P11, P03 | P06, E01–E07 |
| **Administration** (FR-071–076) | P07, P09 | P08, P13 |
| **Developer Platform** (FR-077–082) | P09, P10 | E02–E11, E15 |

### 13.3 Persona to NFR Mapping

| NFR Category | Primary Personas Affected | Key NFRs |
|---|---|---|
| **Performance** | P01–P06, P10, P11, E02–E10 | NFR-001–NFR-017 |
| **Scalability** | P07, P09, P08 | NFR-018–NFR-022 |
| **Availability** | P01–P13, E01–E15 | NFR-023–NFR-031 |
| **Security** | P07, P09, P08, P12 | NFR-032–NFR-044 |
| **Data Management** | P01–P06, P10, P12 | NFR-045–NFR-051 |
| **Usability** | P01–P13, E01–E15 | NFR-052–NFR-056 |
| **Accessibility** | E01, E14, E12, P12 | NFR-057–NFR-061 |
| **Interoperability** | P09, P10, E02–E11, E15 | NFR-062–NFR-065 |
| **Maintainability** | P09, P10, P13 | NFR-066–NFR-070 |
| **Observability** | P09, P05, P07 | NFR-071–NFR-077 |
| **Deployment** | P09, P07 | NFR-078–NFR-083 |
| **Compliance** | P08, P07, P09 | NFR-084–NFR-086 |

### 13.4 Persona to User Story Mapping

| Persona | Primary User Stories | Total Stories |
|---|---|---|
| P01 — Forecaster | US-001, US-007 | 2+ |
| P02 — Scientist | US-012 | 1+ |
| P03 — Meteorologist | US-010, US-015 | 2+ |
| P04 — GIS Specialist | US-002 | 1+ |
| P05 — Data Analyst | US-011 | 1+ |
| P06 — Services Officer | US-009, US-018 | 2+ |
| P07 — Administrator | US-003, US-021 | 2+ |
| P08 — Executive | US-004 | 1+ |
| P09 — IT Admin | US-005, US-022 | 2+ |
| P10 — AI Analyst | US-023 | 1+ |
| P11 — Comms Officer | US-015 | 1+ |
| P12 — Reviewer | US-008 | 1+ |
| P13 — QA Officer | US-006 | 1+ |
| E01 — Farmer | US-016 | 1+ |
| E02–E10 — Sector Users | US-017, US-019 | 2+ |
| E11 — Researcher | US-013 | 1+ |
| E12 — Student | US-014 | 1+ |
| E13 — Journalist | US-017 | 1+ |
| E14 — Public User | US-017 | 1+ |
| E15 — Int'l Partner | US-020 | 1+ |

---

## 14. Conclusion

### 14.1 The Persona-Centred Design Foundation

This chapter has defined the complete human landscape of ClimateX — 28 individual personas and 9 organizational profiles, each with their own goals, workflows, pain points, and success criteria. Together, they represent the full diversity of users and stakeholders that ClimateX must serve.

### 14.2 How Personas Guide Development

From this point forward, every design and development decision should be tested against these personas:

| Activity | Persona Question |
|---|---|
| **Feature Prioritization** | Which persona needs this feature most urgently? How many personas benefit? |
| **UI Design** | Can the least technically proficient persona complete this task? Is the interface accessible to all personas? |
| **Workflow Design** | Does this workflow match how the persona actually works? Are there unnecessary steps? |
| **Permission Modelling** | Does this persona have access to what they need? Are they restricted from what they shouldn't access? |
| **Communication Design** | Is this communication in the right channel and language for the target persona? |
| **Testing** | Are test scenarios based on real persona workflows? Are personas represented in UAT? |
| **Training & Documentation** | Is training content tailored to each persona's technical level and use cases? |

### 14.3 The Persona-Requirement-Architecture Chain

The complete requirements foundation for ClimateX is now established:

| Layer | Document | Chapter |
|---|---|---|
| Vision | Why ClimateX exists | Chapter 1 |
| Business Requirements | What the organization needs | Chapter 2 |
| Functional Requirements | What the system must do | Chapter 3 |
| Non-Functional Requirements | How well it must do it | Chapter 4 |
| **User Personas** | **Who it is built for** | **Chapter 5** |

The next chapter will translate these requirements and personas into the **System Architecture** — the technical blueprint that defines how ClimateX will be built to serve all these users while meeting every functional and non-functional requirement.

### 14.4 Living Document

Personas should not remain static. As ClimateX evolves:

- New personas should be added as new user communities are identified
- Existing personas should be updated as user needs and behaviours change
- Persona validation should be conducted through regular user research
- Persona satisfaction metrics should be tracked and reported

This living document will ensure that ClimateX remains **user-centred** throughout its lifecycle, delivering real value to the diverse communities it serves.

---

*End of Chapter 5 — User Personas & Stakeholder Profiles*

*ClimateX Enterprise Blueprint — Volume 1: Foundation & System Architecture*

*Document Version 1.0 — July 2026*
