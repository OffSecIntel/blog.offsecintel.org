---
id: "author-template"
name: "Template Author"
alias: "template_alias"
githubUrl: "https://github.com/your-github-username"
htbUrl: "https://www.linkedin.com/in/your-linkedin"
role: "Security Researcher / Threat Analyst"
specialties: "Reverse Engineering, Malware Analysis, Detection Engineering, Incident Response"
published: false
active: false
---
# Template Author: Profile Guidelines

This file is a configuration blueprint and markdown template for creating a new analyst profile. Profiles are parsed and displayed inside the **Analyst Dossier** view of the threat intelligence platform.

---

## 🛠️ 1. Frontmatter Configuration

Every author profile requires a YAML frontmatter block. The table below details each configuration key:

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `id` | String | Yes | Unique identifier (e.g., `"john_doe"`). This must match the `author` field in posts exactly. |
| `name` | String | Yes | The author's full display name (e.g., `"John Doe"`). |
| `alias` | String | No | Online alias or handle (e.g., `"shadow_rever"`). |
| `githubUrl` | String | No | Direct link to the author's GitHub profile. |
| `htbUrl` | String | No | Direct link to LinkedIn, Hack The Box, or other portfolio websites. |
| `role` | String | Yes | Professional title or defense role (e.g., `"Lead Malware Analyst"`). |
| `specialties` | String | Yes | Comma-separated list of analytical focus areas. |
| `published` | Boolean | Yes | Set to `false` to keep this template from appearing on the public roster list. |
| `active` | Boolean | Yes | Set to `false` to mark the profile as historical or inactive. |

---

## 📝 2. Writing Your Biography

The remainder of this file contains the author's dynamic, styled biography rendered in the Analyst Dossier. Use standard Markdown to organize your information.

### Core Specialties & Areas of Research
Define your focus using bulleted lists:
*   **Specialty A:** Brief details on frameworks, tooling, and telemetry architectures.
*   **Specialty B:** Explaining dynamic reversing methodologies, binary patching, and threat hunting telemetry.

### Academic and Professional Accomplishments
-   **Certifications:** Highlight relevant professional training (e.g., GIAC, OSCP, CEH).
-   **Publications:** Detail industry publications, white papers, or open-source defense tool projects.
