// Shared content data for Privacy Policy and Terms of Service
const legalContent = {
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "09/07/2025",
    sections: [
      {
        title: "1. Information We Collect",
        content: "We collect minimal operational data to improve our services. This includes:",
        list: ["Anonymous usage statistics (e.g. click tracking)", "Performance metrics", "Error reports"],
        additionalText:
          "We do not collect personal information, and no registration or login system is in place to store your data.",
      },
      {
        title: "2. Data Security",
        content:
          "Since we do not collect personal information, we do not store or manage sensitive data. Any operational data we collect is used solely for the purpose of enhancing the user experience and troubleshooting.",
      },
      {
        title: "3. Cookies and Tracking Technologies",
        content:
          "Our services may use cookies or similar technologies to improve user experience and track usage statistics. You can control cookie settings via your browser preferences. No personal information is linked to these technologies.",
      },
      {
        title: "4. Changes to This Policy",
        content: "We may update this policy periodically. The latest version will always be available on this page.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    lastUpdated: "09/07/2025",
    sections: [
      {
        title: "1. Acceptance of Terms",
        content:
          'By accessing or using this service, you acknowledge and agree to abide by these Terms of Service (the "Agreement"). Even if you do not explicitly accept these terms, your continued use of the service constitutes your consent to be bound by them. If you do not agree to any part of these terms, you must refrain from using the service.',
      },
      {
        title: "2. Compliance with Applicable Laws",
        content:
          "You agree to comply with all applicable laws, regulations, and third-party rights when using the service. This includes, but is not limited to, respecting privacy, intellectual property, and local laws related to your use of the service.",
      },
      {
        title: "3. User Content",
        content:
          "You retain full ownership of the content you create, upload, or submit to the service. However, by submitting content, you grant us a worldwide, royalty-free, non-exclusive license to use, display, and distribute your content within the platform for the purpose of facilitating the operation and functionality of the service. You represent and warrant that you hold all necessary rights and permissions for the content you submit.",
      },
      {
        title: "4. No Warranty",
        content:
          'The service is provided on an "as is" and "as available" basis. We make no representations or warranties, express or implied, regarding the service, its functionality, or its availability. We are not liable for any damages or losses, including but not limited to, direct, indirect, incidental, or consequential damages, arising from the use of, or inability to use, the service.',
      },
      {
        title: "5. Prohibited Conduct",
        content: "You agree not to engage in any activity that may:",
        list: [
          "Violate any applicable law or regulation.",
          "Infringe on the intellectual property rights of others.",
          "Reverse engineer, decompile, disassemble, or exploit the service for any unauthorized purposes.",
          "Disrupt, interfere with, or impair the functionality of the service or other users' experience.",
        ],
      },
      {
        title: "6. Termination of Access",
        content:
          "We reserve the right to suspend or terminate your access to the service at our discretion, with or without cause, and without notice. Termination may occur for any violation of these Terms of Service, including but not limited to unlawful use, infringement of intellectual property rights, or failure to comply with the guidelines set forth in this agreement.",
      },
      {
        title: "7. Platform Guidelines Compliance",
        content:
          "As a user, you agree to adhere to the specific guidelines and community standards of the platform, as updated from time to time. Any violations of these guidelines may result in the immediate suspension or termination of your account and access to the service.",
      },
      {
        title: "8. Limitation of Liability",
        content:
          "In no event shall we, or our affiliates, be liable for any direct, indirect, incidental, special, punitive, or consequential damages, or any loss of data, revenue, or profits, arising out of or in connection with your use of the service.",
      },
      {
        title: "9. Modifications to the Terms",
        content:
          "We reserve the right to modify or update these Terms of Service at any time. Any changes will be effective upon posting to this page. Continued use of the service after such modifications constitutes your acceptance of the updated terms.",
      },
      {
        title: "10. Affiliate Disclosure",
        content:
          "key-empire.com may earn a commission in exchange for your patronage from links provided on the website. This does not change the price you pay.",
      },
    ],
  },
}

// Function to render content dynamically
function renderLegalContent(pageType) {
  const data = legalContent[pageType]
  if (!data) return

  // Update title
  document.title = `${data.title}`
  document.querySelector(".page-title").textContent = data.title

  // Find the notepad container
  const notepad = document.querySelector(".notepad")

  // Clear existing content sections
  const existingSections = notepad.querySelectorAll(".content-section")
  existingSections.forEach((section) => section.remove())

  // Add sections
  data.sections.forEach((section) => {
    const sectionDiv = document.createElement("div")
    sectionDiv.className = "content-section"

    const title = document.createElement("h2")
    title.className = "section-title"
    title.textContent = section.title
    sectionDiv.appendChild(title)

    const content = document.createElement("p")
    content.className = "section-content"
    content.textContent = section.content
    sectionDiv.appendChild(content)

    if (section.list) {
      const ul = document.createElement("ul")
      ul.className = "section-list"
      section.list.forEach((item) => {
        const li = document.createElement("li")
        li.textContent = item
        ul.appendChild(li)
      })
      sectionDiv.appendChild(ul)
    }

    if (section.additionalText) {
      const additionalP = document.createElement("p")
      additionalP.className = "section-content"
      additionalP.textContent = section.additionalText
      sectionDiv.appendChild(additionalP)
    }

    notepad.appendChild(sectionDiv)
  })
}
