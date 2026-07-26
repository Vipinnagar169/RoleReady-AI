/**
 * Professional Resume HTML Template
 * Format: Standard Indian Engineering Student Resume
 * Matches the uploaded template format exactly
 */

function sanitizeField(val, fallback = "") {
    if (!val || typeof val !== 'string') return fallback
    const clean = val.trim()
    const lower = clean.toLowerCase()
    if (
        lower === 'not provided' ||
        lower === 'not applicable' ||
        lower === 'n/a' ||
        lower === 'none' ||
        lower.includes('your full name') ||
        lower.includes("candidate's full name") ||
        lower.includes('[your full name]') ||
        lower.includes('[full name]')
    ) {
        return fallback
    }
    return clean
}

function buildResumeHtml(data) {
    const defaultName = data.userName || "Vipin Nagar"
    const defaultEmail = data.userEmail || "vipin.nagar@example.com"

    let fullName = sanitizeField(data.fullName, defaultName)
    let city = sanitizeField(data.city, "Jodhpur, Rajasthan")
    let phone = sanitizeField(data.phone, "+91-9876543210")
    let email = sanitizeField(data.email, defaultEmail)
    let linkedin = sanitizeField(data.linkedin, "linkedin.com/in/vipinnagar")
    let github = sanitizeField(data.github, "github.com/vipinnagar")
    let careerObjective = sanitizeField(data.careerObjective, "")

    const education = Array.isArray(data.education) ? data.education : []
    let technicalSkills = (data.technicalSkills && typeof data.technicalSkills === 'object') ? data.technicalSkills : {}

    // Ensure standard skill categories are present if candidate provided skills
    const rawSkills = data.skills ? String(data.skills) : ""
    if (rawSkills && Object.keys(technicalSkills).length === 0) {
        technicalSkills = {
            "Technical Skills": rawSkills.split(',').map(s => s.trim())
        }
    }

    const projects = Array.isArray(data.projects) ? data.projects : []
    const internships = Array.isArray(data.internships) ? data.internships : []
    const certifications = Array.isArray(data.certifications) ? data.certifications : []
    const achievements = Array.isArray(data.achievements) ? data.achievements : []

    const contactParts = [city, phone, email, linkedin, github].filter(Boolean)

    const educationRows = education.map(edu => {
        const degree = sanitizeField(edu.degree, "B.Tech")
        const spec = sanitizeField(edu.specialization, "")
        const inst = sanitizeField(edu.institution, "MBM University, Jodhpur")
        const cgpa = sanitizeField(edu.cgpa, "")
        const pct = sanitizeField(edu.percentage, "")
        const yr = sanitizeField(edu.year, "")

        return `
        <tr>
            <td style="padding: 3px 0;">
                <strong>${degree}</strong>${spec ? ` — ${spec}` : ""}
                ${inst ? `<br><span style="font-size:12px; color:#444;">${inst}</span>` : ""}
                ${cgpa ? `&nbsp;&nbsp;|&nbsp;&nbsp;CGPA: ${cgpa}` : ""}
                ${pct ? `&nbsp;&nbsp;|&nbsp;&nbsp;${pct}` : ""}
            </td>
            <td style="text-align:right; white-space:nowrap; font-size:12px; vertical-align:top; padding: 3px 0; color:#333;">
                ${yr}
            </td>
        </tr>
    `}).join("")

    const skillsHtml = Object.entries(technicalSkills).map(([key, value]) => {
        const valArr = Array.isArray(value) ? value : String(value || "").split(',').map(s => s.trim())
        const cleanArr = valArr.filter(v => v && typeof v === 'string' && v.trim() !== '')
        if (cleanArr.length === 0) return ""
        return `
        <tr>
            <td style="padding: 3px 0; vertical-align:top; white-space:nowrap; font-weight:bold; font-size:13px; padding-right:12px; width: 190px;">${key}:</td>
            <td style="padding: 3px 0; font-size:13px; color:#111;">${cleanArr.join(", ")}</td>
        </tr>
    `}).join("")

    const projectsHtml = projects.map(p => {
        const title = sanitizeField(p.title, "Academic Project")
        const dur = sanitizeField(p.duration, "")
        const bullets = Array.isArray(p.bullets) ? p.bullets.filter(b => b && b.trim()) : []
        return `
        <div style="margin-bottom:10px;">
            <table width="100%"><tr>
                <td><strong style="font-size:13px; color:#000;">${title}</strong></td>
                <td style="text-align:right; font-size:12px; white-space:nowrap; color:#444;">${dur}</td>
            </tr></table>
            ${bullets.length ? `<ul style="margin:3px 0 0 18px; padding:0; font-size:13px; color:#222;">
                ${bullets.map(b => `<li style="margin-bottom:3px; text-align:justify;">${b}</li>`).join("")}
            </ul>` : ""}
        </div>
    `}).join("")

    const internshipsHtml = internships.map(i => {
        const role = sanitizeField(i.role, "Intern")
        const comp = sanitizeField(i.company, "")
        const dur = sanitizeField(i.duration, "")
        const bullets = Array.isArray(i.bullets) ? i.bullets.filter(b => b && b.trim()) : []
        return `
        <div style="margin-bottom:10px;">
            <table width="100%"><tr>
                <td><strong style="font-size:13px; color:#000;">${role}${comp ? ` — ${comp}` : ""}</strong></td>
                <td style="text-align:right; font-size:12px; white-space:nowrap; color:#444;">${dur}</td>
            </tr></table>
            ${bullets.length ? `<ul style="margin:3px 0 0 18px; padding:0; font-size:13px; color:#222;">
                ${bullets.map(b => `<li style="margin-bottom:3px; text-align:justify;">${b}</li>`).join("")}
            </ul>` : ""}
        </div>
    `}).join("")

    const certHtml = certifications.map(c =>
        `<li style="font-size:13px; margin-bottom:3px;">${c}</li>`
    ).join("")

    const achieveHtml = achievements.map(a =>
        `<li style="font-size:13px; margin-bottom:3px;">${a}</li>`
    ).join("")

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${fullName} - Resume</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 13px;
    color: #000;
    background: #fff;
    padding: 25px 35px;
    line-height: 1.45;
  }
  .header {
    text-align: center;
    margin-bottom: 8px;
  }
  .header h1 {
    font-size: 22px;
    font-weight: bold;
    color: #1a237e;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4px;
  }
  .header .contact {
    font-size: 12px;
    color: #333;
  }
  .divider {
    border: none;
    border-top: 1.5px solid #1a237e;
    margin: 6px 0 8px 0;
  }
  .section-title {
    font-size: 13px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #000;
    border-bottom: 1px solid #000;
    padding-bottom: 2px;
    margin: 10px 0 6px 0;
  }
  table { border-collapse: collapse; width: 100%; }
</style>
</head>
<body>

<div class="header">
  <h1>${fullName}</h1>
  <div class="contact">${contactParts.join(" | ")}</div>
</div>

<hr class="divider"/>

${careerObjective ? `
<div class="section-title">Career Objective</div>
<p style="font-size:13px; text-align:justify; color:#111;">${careerObjective}</p>
` : ""}

${education.length ? `
<div class="section-title">Education</div>
<table>${educationRows}</table>
` : ""}

${skillsHtml ? `
<div class="section-title">Technical Skills</div>
<table>${skillsHtml}</table>
` : ""}

${projects.length ? `
<div class="section-title">Academic Projects</div>
${projectsHtml}
` : ""}

${internships.length ? `
<div class="section-title">Internship / Training</div>
${internshipsHtml}
` : ""}

${certifications.length ? `
<div class="section-title">Certifications</div>
<ul style="margin-left:18px; padding:0;">${certHtml}</ul>
` : ""}

${achievements.length ? `
<div class="section-title">Achievements &amp; Extra-Curricular</div>
<ul style="margin-left:18px; padding:0;">${achieveHtml}</ul>
` : ""}

</body>
</html>`
}

module.exports = { buildResumeHtml, sanitizeField }
