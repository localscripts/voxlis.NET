const expData = [
]

  
  
  let deletedPrograms = []
  
  
  function loadFromLocalStorage() {
    const savedData = localStorage.getItem("programManagerData")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        if (parsedData.expData && Array.isArray(parsedData.expData)) {
          expData = parsedData.expData
        }
        if (parsedData.deletedPrograms && Array.isArray(parsedData.deletedPrograms)) {
          deletedPrograms = parsedData.deletedPrograms
        }
        notify("Data loaded from local storage", "success")
      } catch (error) {
        console.error("Error loading data from localStorage:", error)
        notify("Error loading saved data", "error")
      }
    }
  }
  
  
  function saveToLocalStorage() {
    try {
      const dataToSave = {
        expData: expData,
        deletedPrograms: deletedPrograms,
      }
      localStorage.setItem("programManagerData", JSON.stringify(dataToSave))
  
      
      const indicator = document.querySelector(".auto-save-indicator")
      indicator.classList.remove("saving")
      indicator.innerHTML = '<i class="fas fa-save"></i> Saved to local storage'
  
      
      setTimeout(() => {
        indicator.innerHTML = '<i class="fas fa-save"></i> Auto-saving'
      }, 3000)
    } catch (error) {
      console.error("Error saving to localStorage:", error)
      notify("Error saving data", "error")
    }
  }
  
  let selectedPrograms = [] 
  let currentProgram = null 
  let autoSaveTimeout = null
  const AUTO_SAVE_DELAY = 1000 
  const isSingleSelectionMode = false 
  
  
  function initializeUI() {
    
    loadFromLocalStorage()
  
    populateProgramList()
    updateTrashList()
    setupEventListeners()
    updateUI()
    updateStats()
  
    
    setupResizeHandles()
  }
  
  function setupResizeHandles() {
    const resizeHandles = document.querySelectorAll(".resize-handle")
  
    resizeHandles.forEach((handle) => {
      handle.addEventListener("mousedown", startResize)
    })
  
    function startResize(e) {
      e.preventDefault()
  
      const handle = e.target
      const parent = handle.parentElement
      const isTopLeft = handle.classList.contains("top-left")
      const isTopRight = handle.classList.contains("top-right")
      const isBottomLeft = handle.classList.contains("bottom-left")
      const isBottomRight = handle.classList.contains("bottom-right")
  
      const startX = e.clientX
      const startY = e.clientY
      const startWidth = parent.offsetWidth
      const startHeight = parent.offsetHeight
      const startLeft = parent.offsetLeft
      const startTop = parent.offsetTop
  
      document.addEventListener("mousemove", resize)
      document.addEventListener("mouseup", stopResize)
  
      function resize(e) {
        let newWidth, newHeight, newLeft, newTop
  
        if (isBottomRight || isTopRight) {
          newWidth = startWidth + (e.clientX - startX)
          parent.style.width = `${Math.max(300, newWidth)}px`
        }
  
        if (isBottomRight || isBottomLeft) {
          newHeight = startHeight + (e.clientY - startY)
          parent.style.height = `${Math.max(200, newHeight)}px`
        }
  
        if (isTopLeft || isBottomLeft) {
          newWidth = startWidth - (e.clientX - startX)
          newLeft = startLeft + (e.clientX - startX)
          if (newWidth >= 300) {
            parent.style.width = `${newWidth}px`
            parent.style.left = `${newLeft}px`
          }
        }
  
        if (isTopLeft || isTopRight) {
          newHeight = startHeight - (e.clientY - startY)
          newTop = startTop + (e.clientY - startY)
          if (newHeight >= 200) {
            parent.style.height = `${newHeight}px`
            parent.style.top = `${newTop}px`
          }
        }
      }
  
      function stopResize() {
        document.removeEventListener("mousemove", resize)
        document.removeEventListener("mouseup", stopResize)
      }
    }
  }
  
  function populateProgramList() {
    const programList = document.getElementById("programList")
    programList.innerHTML = ""
  
    if (expData.length === 0) {
      programList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-circle"></i>
          <p>No programs found.</p>
        </div>
      `
      return
    }
  
    expData.forEach((program) => {
      const programItem = document.createElement("div")
      programItem.className = "program-item"
      programItem.dataset.id = program.id
  
      
      let badges = ""
      if (program.verified) {
        badges += '<span class="badge badge-verified">Verified</span>'
      }
      if (program.premium) {
        badges += '<span class="badge badge-premium">Premium</span>'
      }
      if (program.hide) {
        badges += '<span class="badge badge-hidden">Hidden</span>'
      }
  
      programItem.innerHTML = `
        <label class="custom-checkbox program-item-checkbox">
          <input type="checkbox" class="custom-checkbox-input program-checkbox" data-id="${program.id}">
          <span class="custom-checkbox-mark"></span>
        </label>
        <div>
          <div class="program-item-name">${program.name} ${badges}</div>
          <div class="program-item-desc">${program.desc || ""}</div>
        </div>
      `
  
      programList.appendChild(programItem)
  
      
      programItem.addEventListener("click", (e) => {
        
        if (!e.target.closest(".custom-checkbox")) {
          selectProgramItem(program.id)
        }
      })
  
      
      programItem.addEventListener("dblclick", (e) => {
        
        if (!e.target.closest(".custom-checkbox")) {
          
          selectSingleProgram(program.id)
        }
      })
  
      
      const checkbox = programItem.querySelector(".program-checkbox")
      checkbox.addEventListener("change", (e) => {
        if (e.target.checked) {
          
          if (!selectedPrograms.includes(program.id)) {
            selectedPrograms.push(program.id)
          }
  
          
          currentProgram = program
          updateFormFields(program)
        } else {
          
          selectedPrograms = selectedPrograms.filter((id) => id !== program.id)
  
          
          if (currentProgram && currentProgram.id === program.id) {
            currentProgram = selectedPrograms.length > 0 ? expData.find((p) => p.id === selectedPrograms[0]) : null
  
            if (currentProgram) {
              updateFormFields(currentProgram)
            } else {
              clearForm()
            }
          }
        }
  
        updateProgramSelection()
      })
    })
  }
  
  function selectProgramItem(id) {
    const program = expData.find((p) => p.id === id)
    if (!program) return
  
    
    const checkbox = document.querySelector(`.program-checkbox[data-id="${id}"]`)
    checkbox.checked = !checkbox.checked
  
    
    const event = new Event("change")
    checkbox.dispatchEvent(event)
  }
  
  function selectSingleProgram(id) {
    const program = expData.find((p) => p.id === id)
    if (!program) return
  
    
    document.querySelectorAll(".program-checkbox").forEach((checkbox) => {
      checkbox.checked = false
    })
  
    
    selectedPrograms = []
  
    
    const checkbox = document.querySelector(`.program-checkbox[data-id="${id}"]`)
    checkbox.checked = true
  
    
    selectedPrograms.push(id)
  
    
    currentProgram = program
    updateFormFields(program)
  
    
    updateProgramSelection()
  
    
    notify(`Selected ${program.name}`)
  }
  
  function updateFormFields(program) {
    
    document.getElementById("exploitName").value = program.name || ""
    document.getElementById("exploitDesc").value = program.desc || ""
    document.getElementById("exploitId").value = program.id || ""
    document.getElementById("exploitInfo").value = program.info || ""
  
    
    document.getElementById("websiteUrl").value = program.href || ""
    document.getElementById("priceUrl").value = program.priceHref || ""
  
    
    document.getElementById("verifiedFlag").checked = program.verified || false
    document.getElementById("premiumFlag").checked = program.premium || false
    document.getElementById("hideFlag").checked = program.hide || false
  
    
    updatePlatformOptions(program.plat || [])
  
    
    updatePriceOptions(program)
  
    
    document.getElementById("exploitLevel").value = program.lvl || 8
    document.getElementById("exploitEditor").value = program.editor || ""
  
    
    populateAttributesList("editProsList", program.pros || [])
    populateAttributesList("editNeutralList", program.neutral || [])
    populateAttributesList("editConsList", program.cons || [])
  
    
    updateUI()
  }
  
  
  function populateAttributesList(listId, items) {
    const list = document.getElementById(listId)
    list.innerHTML = ""
  
    if (items.length === 0) {
      
      addItemRow(listId)
    } else {
      items.forEach((item) => {
        const row = document.createElement("div")
        row.className = "item-row"
        row.innerHTML = `
          <input type="text" value="${item}" placeholder="Enter a feature">
          <button type="button" class="remove-item-btn"><i class="fas fa-times"></i></button>
        `
  
        list.appendChild(row)
  
        
        const removeBtn = row.querySelector(".remove-item-btn")
        removeBtn.addEventListener("click", () => {
          removeItemRow(row)
          if (currentProgram) {
            saveChanges()
          }
        })
  
        
        const input = row.querySelector("input")
        input.addEventListener("input", () => {
          if (currentProgram) {
            
            if (autoSaveTimeout) {
              clearTimeout(autoSaveTimeout)
            }
  
            
            autoSaveTimeout = setTimeout(() => {
              saveChanges()
            }, AUTO_SAVE_DELAY)
          }
        })
      })
    }
  }
  
  function updatePlatformOptions(platforms) {
    document.querySelectorAll(".platform-option").forEach((option) => {
      const platform = option.dataset.platform
      if (platforms.includes(platform)) {
        option.classList.add("selected")
      } else {
        option.classList.remove("selected")
      }
    })
  }
  
  function updatePriceOptions(program) {
    
    const isFree = program.price === "FREE" || !program.price
  
    
    document.getElementById("priceFree").checked = isFree
    document.getElementById("pricePaid").checked = !isFree
  
    
    const priceInputs = document.getElementById("priceInputs")
    priceInputs.style.display = isFree ? "none" : "flex"
  
    
    if (!isFree) {
      
      const priceAmount = program.price.replace("$", "")
      document.getElementById("priceAmount").value = priceAmount
  
      
      if (program.period) {
        document.getElementById("pricePeriod").value = program.period
      } else {
        document.getElementById("pricePeriod").value = "lifetime"
      }
    }
  }
  
  function updateUI() {
    const title = document.getElementById("infoModalTitle")
    const name = document.getElementById("infoModalExploitName")
    const desc = document.getElementById("infoModalExploitDesc")
    const md = document.getElementById("infoModalMarkdown")
    const out = document.getElementById("outputFormat")
    const preview = document.getElementById("markdownPreview")
  
    const nameVal = document.getElementById("exploitName").value
    const descVal = document.getElementById("exploitDesc").value
    const infoVal = document.getElementById("exploitInfo").value
  
    
    const marked = window.marked
  
    if (currentProgram) {
      title.textContent = `${nameVal} Information`
      name.textContent = nameVal
      desc.textContent = descVal
  
      if (infoVal) {
        const parsed = marked.parse(infoVal)
        md.innerHTML = parsed
  
        if (preview) {
          preview.innerHTML = parsed
        }
  
        if (window.hljs) {
          document.querySelectorAll("#infoModalMarkdown pre code, #markdownPreview pre code").forEach((block) => {
            window.hljs.highlightElement(block)
          })
        }
      } else {
        md.innerHTML = "<p>No additional information available for this program.</p>"
        if (preview) {
          preview.innerHTML = "<p>No content to preview.</p>"
        }
      }
  
      
      if (out) {
        
        const selectedPlatforms = []
        document.querySelectorAll(".platform-option.selected").forEach((option) => {
          selectedPlatforms.push(option.dataset.platform)
        })
  
        
        let priceValue = "FREE"
        let periodValue = null
  
        if (document.getElementById("pricePaid").checked) {
          const amount = document.getElementById("priceAmount").value
          priceValue = `$${amount}`
          periodValue = document.getElementById("pricePeriod").value
          if (periodValue === "lifetime") {
            periodValue = null
          }
        }
  
        
        const websiteUrl = document.getElementById("websiteUrl").value
        const priceUrl = document.getElementById("priceUrl").value
  
        
        const level = document.getElementById("exploitLevel").value
        const editor = document.getElementById("exploitEditor").value
  
        
        const pros = getAttributesFromList("editProsList")
        const neutral = getAttributesFromList("editNeutralList")
        const cons = getAttributesFromList("editConsList")
  
        const currentData = {
          id: document.getElementById("exploitId").value,
          name: nameVal,
          desc: descVal,
          info: infoVal,
          verified: document.getElementById("verifiedFlag").checked,
          premium: document.getElementById("premiumFlag").checked,
          hide: document.getElementById("hideFlag").checked,
          plat: selectedPlatforms,
          price: priceValue,
          lvl: Number.parseInt(level),
          editor: editor,
          pros: pros,
          neutral: neutral,
          cons: cons,
          
          ...(periodValue ? { period: periodValue } : {}),
          
          txtColor: currentProgram.txtColor,
          accentColor: currentProgram.accentColor,
          href: websiteUrl,
          priceHref: priceUrl,
        }
  
        
        const jsOutput = `  {
      id: "${currentData.id}",
      name: "${currentData.name}",
      desc: "${currentData.desc}",
      lvl: ${currentData.lvl},
      price: "${currentData.price}",
      ${
        currentData.period
          ? `period: "${currentData.period}",
      `
          : ""
      }plat: [${currentData.plat.map((p) => `"${p}"`).join(", ")}],
      pros: [${currentData.pros.map((p) => `"${p}"`).join(", ")}],
      neutral: [${currentData.neutral.map((n) => `"${n}"`).join(", ")}],
      cons: [${currentData.cons.map((c) => `"${c}"`).join(", ")}],
      verified: ${currentData.verified},
      editor: "${currentData.editor}",
      txtColor: "${currentData.txtColor}",
      accentColor: "${currentData.accentColor}",
      ${
        currentData.info
          ? `info: ${JSON.stringify(currentData.info)},
      `
          : ""
      }premium: ${currentData.premium},
      href: "${currentData.href}",
      priceHref: "${currentData.priceHref}",
      hide: ${currentData.hide},
    }`
  
        out.textContent = jsOutput
      }
    } else {
      title.textContent = "Exploit Information"
      name.textContent = "Select a program"
      desc.textContent = "Please select a program from the list to view details."
      md.innerHTML = "<p>No program selected.</p>"
  
      if (preview) {
        preview.innerHTML = "<p>No program selected.</p>"
      }
  
      if (out) {
        out.textContent = "No program selected."
      }
    }
  }
  
  
  function getAttributesFromList(listId) {
    const attributes = []
    document.querySelectorAll(`#${listId} .item-row input`).forEach((input) => {
      if (input.value.trim()) {
        attributes.push(input.value.trim())
      }
    })
    return attributes
  }
  
  function updateStats() {
    document.getElementById("totalPrograms").textContent = expData.length
    document.getElementById("verifiedCount").textContent = expData.filter((p) => p.verified).length
    document.getElementById("premiumCount").textContent = expData.filter((p) => p.premium).length
  }
  
  function updateProgramSelection() {
    
    document.getElementById("selectedCount").textContent = `${selectedPrograms.length} selected`
  
    
    const bulkEditPanel = document.getElementById("bulkEditPanel")
    if (selectedPrograms.length > 1) {
      bulkEditPanel.classList.add("active")
    } else {
      bulkEditPanel.classList.remove("active")
    }
  
    
    document.querySelectorAll(".program-item").forEach((item) => {
      const id = item.dataset.id
      if (selectedPrograms.includes(id)) {
        item.classList.add("selected")
      } else {
        item.classList.remove("selected")
      }
    })
  }
  
  
  function updateTrashList() {
    const trashList = document.getElementById("trashList")
    trashList.innerHTML = ""
  
    if (deletedPrograms.length === 0) {
      trashList.innerHTML = '<div class="trash-empty">No deleted programs found.</div>'
      return
    }
  
    deletedPrograms.forEach((program) => {
      const trashItem = document.createElement("div")
      trashItem.className = "trash-item"
      trashItem.dataset.id = program.id
  
      trashItem.innerHTML = `
        <div class="trash-item-name">${program.name}</div>
        <div class="trash-item-actions">
          <button class="trash-item-action restore" title="Restore program">
            <i class="fas fa-undo"></i>
          </button>
          <button class="trash-item-action delete" title="Permanently delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `
  
      trashList.appendChild(trashItem)
  
      
      const restoreBtn = trashItem.querySelector(".restore")
      restoreBtn.addEventListener("click", () => {
        restoreProgram(program.id)
      })
  
      
      const deleteBtn = trashItem.querySelector(".delete")
      deleteBtn.addEventListener("click", () => {
        permanentlyDeleteProgram(program.id)
      })
    })
  }
  
  
  function deleteProgram(id) {
    const programIndex = expData.findIndex((p) => p.id === id)
    if (programIndex === -1) return
  
    
    const deletedProgram = expData.splice(programIndex, 1)[0]
    deletedPrograms.push(deletedProgram)
  
    
    populateProgramList()
    updateTrashList()
    updateStats()
  
    
    if (currentProgram && currentProgram.id === id) {
      currentProgram = null
      clearForm()
    }
  
    
    selectedPrograms = selectedPrograms.filter((programId) => programId !== id)
    updateProgramSelection()
  
    
    saveToLocalStorage()
  
    
    notify(`Moved "${deletedProgram.name}" to trash`)
  }
  
  
  function restoreProgram(id) {
    const programIndex = deletedPrograms.findIndex((p) => p.id === id)
    if (programIndex === -1) return
  
    
    const restoredProgram = deletedPrograms.splice(programIndex, 1)[0]
    expData.push(restoredProgram)
  
    
    populateProgramList()
    updateTrashList()
    updateStats()
  
    
    saveToLocalStorage()
  
    
    notify(`Restored "${restoredProgram.name}" from trash`)
  }
  
  
  function permanentlyDeleteProgram(id) {
    const programIndex = deletedPrograms.findIndex((p) => p.id === id)
    if (programIndex === -1) return
  
    const programName = deletedPrograms[programIndex].name
  
    
    deletedPrograms.splice(programIndex, 1)
  
    
    updateTrashList()
  
    
    saveToLocalStorage()
  
    
    notify(`Permanently deleted "${programName}"`)
  }
  
  
  function emptyTrash() {
    if (deletedPrograms.length === 0) return
  
    
    const confirmed = confirm(
      `Are you sure you want to permanently delete all ${deletedPrograms.length} programs in the trash?`,
    )
    if (!confirmed) return
  
    
    deletedPrograms = []
  
    
    updateTrashList()
  
    
    saveToLocalStorage()
  
    
    notify("Trash emptied")
  }
  
  function setupEventListeners() {
    
    document.getElementById("programSearchInput").addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase()
      document.querySelectorAll(".program-item").forEach((item) => {
        const name = item.querySelector(".program-item-name").textContent.toLowerCase()
        const desc = item.querySelector(".program-item-desc").textContent.toLowerCase()
  
        if (name.includes(searchTerm) || desc.includes(searchTerm)) {
          item.style.display = "flex"
        } else {
          item.style.display = "none"
        }
      })
    })
  
    
    document.getElementById("selectAllBtn").addEventListener("click", () => {
      
      document.querySelectorAll(".program-checkbox").forEach((checkbox) => {
        checkbox.checked = true
      })
  
      
      selectedPrograms = expData.map((p) => p.id)
  
      
      if (selectedPrograms.length > 0) {
        currentProgram = expData.find((p) => p.id === selectedPrograms[0])
        updateFormFields(currentProgram)
      }
  
      
      updateProgramSelection()
  
      
      notify("Selected all programs")
    })
  
    document.getElementById("deselectAllBtn").addEventListener("click", () => {
      
      document.querySelectorAll(".program-checkbox").forEach((checkbox) => {
        checkbox.checked = false
      })
  
      
      selectedPrograms = []
      currentProgram = null
  
      
      clearForm()
  
      
      updateProgramSelection()
  
      
      notify("Deselected all programs")
    })
  
    
    document.getElementById("applyBulkEdit").addEventListener("click", () => {
      if (selectedPrograms.length === 0) {
        notify("No programs selected", "warning")
        return
      }
  
      
      const verifiedFlag = document.getElementById("bulkVerifiedFlag").checked
      const premiumFlag = document.getElementById("bulkPremiumFlag").checked
      const hideFlag = document.getElementById("bulkHideFlag").checked
  
      
      selectedPrograms.forEach((id) => {
        const program = expData.find((p) => p.id === id)
        if (program) {
          program.verified = verifiedFlag
          program.premium = premiumFlag
          program.hide = hideFlag
  
          
          updateProgramItem(program)
        }
      })
  
      
      updateStats()
  
      
      saveToLocalStorage()
  
      
      notify(`Applied bulk edit to ${selectedPrograms.length} programs`)
    })
  
    
    document.querySelectorAll(".dev-controls-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".dev-controls-tab").forEach((t) => {
          t.classList.remove("active")
        })
  
        tab.classList.add("active")
  
        document.querySelectorAll(".tab-content").forEach((content) => {
          content.classList.remove("active")
        })
  
        const tabId = tab.getAttribute("data-tab")
        document.getElementById(`${tabId}-tab`).classList.add("active")
      })
    })
  
    
    document.querySelectorAll(".markdown-help-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".markdown-help-tab").forEach((t) => {
          t.classList.remove("active")
        })
  
        tab.classList.add("active")
  
        document.querySelectorAll(".markdown-help-content").forEach((content) => {
          content.classList.remove("active")
        })
  
        const tabId = tab.getAttribute("data-help-tab")
        document.getElementById(`${tabId}-help`).classList.add("active")
      })
    })
  
    
    document.getElementById("toggleMarkdownHelp").addEventListener("click", () => {
      const helpPanel = document.getElementById("markdownHelp")
      const isVisible = helpPanel.style.display !== "none"
      helpPanel.style.display = isVisible ? "none" : "block"
      document.getElementById("toggleMarkdownHelp").innerHTML = isVisible
        ? '<i class="fas fa-question-circle"></i> Show Markdown Help'
        : '<i class="fas fa-times-circle"></i> Hide Markdown Help'
    })
  
    
    document.querySelectorAll(".markdown-toolbar button").forEach((button) => {
      button.addEventListener("click", () => {
        const textarea = document.getElementById("exploitInfo")
        const mdSyntax = button.getAttribute("data-md")
        const shouldSelect = button.getAttribute("data-select") === "true"
  
        
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = textarea.value.substring(start, end)
  
        
        if (shouldSelect) {
          
          const replacement = mdSyntax.replace("text", selectedText)
          textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end)
  
          
          const newCursorPos = start + replacement.length
          textarea.setSelectionRange(newCursorPos, newCursorPos)
        } else {
          
          textarea.value = textarea.value.substring(0, start) + mdSyntax + textarea.value.substring(end)
  
          
          const newCursorPos = start + mdSyntax.length
          textarea.setSelectionRange(newCursorPos, newCursorPos)
        }
  
        
        textarea.focus()
  
        
        if (currentProgram) {
          
          if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout)
          }
  
          
          autoSaveTimeout = setTimeout(() => {
            saveChanges()
          }, AUTO_SAVE_DELAY)
        }
      })
    })
  
    
    document.getElementById("updateModal").addEventListener("click", () => {
      if (currentProgram) {
        updateUI()
        notify("Preview updated")
      }
    })
  
    
    document.getElementById("resetContent").addEventListener("click", () => {
      if (currentProgram) {
        resetToOriginal()
        notify("Content reset to original")
      } else {
        notify("Please select a program first", "warning")
      }
    })
  
    
    document.getElementById("copyOutput").addEventListener("click", () => {
      const text = document.getElementById("outputFormat").textContent
      navigator.clipboard.writeText(text).then(() => {
        notify("Copied to clipboard!")
      })
    })
  
    
    document.getElementById("exportDataBtn").addEventListener("click", () => {
      if (currentProgram) {
        exportSelectedData()
      } else {
        notify("Please select a program first", "warning")
      }
    })
  
    
    document.getElementById("exportAllDataBtn").addEventListener("click", () => {
      exportAllData()
    })
  
    
    document.getElementById("copySelectedDataBtn").addEventListener("click", () => {
      if (currentProgram) {
        copySelectedData()
      } else {
        notify("Please select a program first", "warning")
      }
    })
  
    
    document.querySelectorAll(".platform-option").forEach((option) => {
      option.addEventListener("click", () => {
        option.classList.toggle("selected")
        if (currentProgram) {
          saveChanges()
        }
      })
    })
  
    
    document.querySelectorAll('input[name="priceType"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        const priceInputs = document.getElementById("priceInputs")
        if (radio.value === "free") {
          priceInputs.style.display = "none"
        } else {
          priceInputs.style.display = "flex"
        }
  
        if (currentProgram) {
          saveChanges()
        }
      })
    })
  
    
    document.getElementById("priceAmount").addEventListener("input", () => {
      if (currentProgram) {
        
        if (autoSaveTimeout) {
          clearTimeout(autoSaveTimeout)
        }
  
        
        autoSaveTimeout = setTimeout(() => {
          saveChanges()
        }, AUTO_SAVE_DELAY)
      }
    })
  
    document.getElementById("pricePeriod").addEventListener("change", () => {
      if (currentProgram) {
        saveChanges()
      }
    })
  
    
    document.getElementById("websiteUrl").addEventListener("input", () => {
      if (currentProgram) {
        
        if (autoSaveTimeout) {
          clearTimeout(autoSaveTimeout)
        }
  
        
        autoSaveTimeout = setTimeout(() => {
          saveChanges()
        }, AUTO_SAVE_DELAY)
      }
    })
  
    document.getElementById("priceUrl").addEventListener("input", () => {
      if (currentProgram) {
        
        if (autoSaveTimeout) {
          clearTimeout(autoSaveTimeout)
        }
  
        
        autoSaveTimeout = setTimeout(() => {
          saveChanges()
        }, AUTO_SAVE_DELAY)
      }
    })
  
    
    document.getElementById("exploitName").addEventListener("input", () => {
      if (currentProgram) {
        
        if (autoSaveTimeout) {
          clearTimeout(autoSaveTimeout)
        }
  
        
        autoSaveTimeout = setTimeout(() => {
          saveChanges()
        }, AUTO_SAVE_DELAY)
      }
    })
  
    document.getElementById("exploitDesc").addEventListener("input", () => {
      if (currentProgram) {
        
        if (autoSaveTimeout) {
          clearTimeout(autoSaveTimeout)
        }
  
        
        autoSaveTimeout = setTimeout(() => {
          saveChanges()
        }, AUTO_SAVE_DELAY)
      }
    })
  
    document.getElementById("exploitInfo").addEventListener("input", () => {
      if (currentProgram) {
        
        if (autoSaveTimeout) {
          clearTimeout(autoSaveTimeout)
        }
  
        
        autoSaveTimeout = setTimeout(() => {
          saveChanges()
        }, AUTO_SAVE_DELAY)
      }
    })
  
    
    document.getElementById("verifiedFlag").addEventListener("change", () => {
      if (currentProgram) {
        saveChanges()
      }
    })
  
    document.getElementById("premiumFlag").addEventListener("change", () => {
      if (currentProgram) {
        saveChanges()
      }
    })
  
    document.getElementById("hideFlag").addEventListener("change", () => {
      if (currentProgram) {
        saveChanges()
      }
    })
  
    
    document.getElementById("exploitLevel").addEventListener("change", () => {
      if (currentProgram) {
        saveChanges()
      }
    })
  
    document.getElementById("exploitEditor").addEventListener("input", () => {
      if (currentProgram) {
        
        if (autoSaveTimeout) {
          clearTimeout(autoSaveTimeout)
        }
  
        
        autoSaveTimeout = setTimeout(() => {
          saveChanges()
        }, AUTO_SAVE_DELAY)
      }
    })
  
    
    document.getElementById("editAddProBtn").addEventListener("click", () => {
      addItemRow("editProsList")
      if (currentProgram) {
        saveChanges()
      }
    })
  
    document.getElementById("editAddNeutralBtn").addEventListener("click", () => {
      addItemRow("editNeutralList")
      if (currentProgram) {
        saveChanges()
      }
    })
  
    document.getElementById("editAddConBtn").addEventListener("click", () => {
      addItemRow("editConsList")
      if (currentProgram) {
        saveChanges()
      }
    })
  
    
    document.getElementById("saveInfoBtn").addEventListener("click", () => {
      if (currentProgram) {
        saveChanges()
        notify("Information saved")
      } else {
        notify("Please select a program first", "warning")
      }
    })
  
    
    document.querySelectorAll(".theme-option").forEach((option) => {
      option.addEventListener("click", () => {
        
        document.querySelectorAll(".theme-option").forEach((opt) => {
          opt.classList.remove("selected")
        })
  
        
        option.classList.add("selected")
  
        
        const theme = option.getAttribute("data-theme")
        document.documentElement.setAttribute("data-theme", theme)
  
        
        localStorage.setItem("programManagerTheme", theme)
  
        
        notify(`Theme changed to ${theme}`)
      })
    })

    document.getElementById("emptyTrashBtn").addEventListener("click", () => {
      emptyTrash()
    })

    document.getElementById("infoModalCloseBtn").addEventListener("click", () => {
      document.querySelector(".info-modal").style.display = "none"
    })
  
    document.getElementById("addNewProgramBtn").addEventListener("click", () => {
      document.getElementById("newAppModal").classList.add("active")
    })
  
    document.getElementById("closeNewAppModal").addEventListener("click", () => {
      document.getElementById("newAppModal").classList.remove("active")
    })
  
    document.getElementById("cancelNewApp").addEventListener("click", () => {
      document.getElementById("newAppModal").classList.remove("active")
    })
    document.getElementById("saveNewApp").addEventListener("click", () => {
      const name = document.getElementById("newAppName").value
      const id = document.getElementById("newAppId").value
      const desc = document.getElementById("newAppDesc").value
      const level = document.getElementById("newAppLevel").value
      const editor = document.getElementById("newAppEditor").value
      const info = document.getElementById("newAppInfo").value
      const websiteUrl = document.getElementById("newAppHref").value
      const priceUrl = document.getElementById("newAppPriceHref").value
      const txtColor = document.getElementById("newAppTxtColor").value
      const accentColor = document.getElementById("newAppAccentColor").value
      const verified = document.getElementById("newAppVerifiedFlag").checked
      const premium = document.getElementById("newAppPremiumFlag").checked
      const hide = document.getElementById("newAppHideFlag").checked
      if (!name || !id || !desc) {
        notify("Please fill in all required fields", "error")
        return
      }

      if (expData.some((p) => p.id === id)) {
        notify("Program ID already exists", "error")
        return
      }

      const selectedPlatforms = []
      document.querySelectorAll("#newAppPlatformOptions .platform-option.selected").forEach((option) => {
        selectedPlatforms.push(option.dataset.platform)
      })

      let priceValue = "FREE"
      let periodValue = null
  
      if (document.getElementById("newAppPricePaid").checked) {
        const amount = document.getElementById("newAppPriceAmount").value
        if (!amount) {
          notify("Please enter a price amount", "error")
          return
        }
        priceValue = `$${amount}`
        periodValue = document.getElementById("newAppPricePeriod").value
        if (periodValue === "lifetime") {
          periodValue = null
        }
      }

      const pros = []
      document.querySelectorAll("#prosList .item-row input").forEach((input) => {
        if (input.value.trim()) {
          pros.push(input.value.trim())
        }
      })
  
      const neutral = []
      document.querySelectorAll("#neutralList .item-row input").forEach((input) => {
        if (input.value.trim()) {
          neutral.push(input.value.trim())
        }
      })
  
      const cons = []
      document.querySelectorAll("#consList .item-row input").forEach((input) => {
        if (input.value.trim()) {
          cons.push(input.value.trim())
        }
      })
      const newProgram = {
        id: id,
        name: name,
        desc: desc,
        lvl: Number.parseInt(level),
        price: priceValue,
        plat: selectedPlatforms,
        pros: pros,
        neutral: neutral,
        cons: cons,
        verified: verified,
        editor: editor,
        txtColor: txtColor,
        accentColor: accentColor,
        info: info,
        premium: premium,
        href: websiteUrl,
        priceHref: priceUrl,
        hide: hide,
      }
      if (periodValue) {
        newProgram.period = periodValue
      }
      expData.push(newProgram)
      populateProgramList()
      updateStats()
      selectSingleProgram(id)
      saveToLocalStorage()
      document.getElementById("newAppModal").classList.remove("active")
      notify("New program added")
    })

    document.querySelectorAll("#newAppPlatformOptions .platform-option").forEach((option) => {
      option.addEventListener("click", () => {
        option.classList.toggle("selected")
      })
    })

    document.querySelectorAll('input[name="newAppPriceType"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        const priceInputs = document.getElementById("newAppPriceInputs")
        if (radio.value === "free") {
          priceInputs.style.display = "none"
        } else {
          priceInputs.style.display = "flex"
        }
      })
    })

    document.getElementById("addProBtn").addEventListener("click", () => {
      addNewAppItemRow("prosList")
    })
  
    document.getElementById("addNeutralBtn").addEventListener("click", () => {
      addNewAppItemRow("neutralList")
    })
  
    document.getElementById("addConBtn").addEventListener("click", () => {
      addNewAppItemRow("consList")
    })
  }

  function addNewAppItemRow(listId) {
    const list = document.getElementById(listId)
    const row = document.createElement("div")
    row.className = "item-row"
    row.innerHTML = `
      <input type="text" placeholder="Enter a feature">
      <button type="button" class="remove-item-btn"><i class="fas fa-times"></i></button>
    `
  
    list.appendChild(row)
    const removeBtn = row.querySelector(".remove-item-btn")
    removeBtn.addEventListener("click", () => {
      row.remove()
    })
  }
  
  function addItemRow(listId) {
    const list = document.getElementById(listId)
    const row = document.createElement("div")
    row.className = "item-row"
    row.innerHTML = `
      <input type="text" placeholder="Enter a feature">
      <button type="button" class="remove-item-btn"><i class="fas fa-times"></i></button>
    `
    list.appendChild(row)
    const removeBtn = row.querySelector(".remove-item-btn")
    removeBtn.addEventListener("click", () => {
      removeItemRow(row)
      if (currentProgram) {
        saveChanges()
      }
    })
  
    const input = row.querySelector("input")
    input.addEventListener("input", () => {
      if (currentProgram) {
        if (autoSaveTimeout) {
          clearTimeout(autoSaveTimeout)
        }
        autoSaveTimeout = setTimeout(() => {
          saveChanges()
        }, AUTO_SAVE_DELAY)
      }
    })
  }
  
  function removeItemRow(row) {
    row.remove()
  }
  
  function clearForm() {
    document.getElementById("exploitName").value = ""
    document.getElementById("exploitDesc").value = ""
    document.getElementById("exploitId").value = ""
    document.getElementById("exploitInfo").value = ""
    document.getElementById("websiteUrl").value = ""
    document.getElementById("priceUrl").value = ""
    document.getElementById("verifiedFlag").checked = false
    document.getElementById("premiumFlag").checked = false
    document.getElementById("hideFlag").checked = false
    document.getElementById("exploitLevel").value = "8"
    document.getElementById("exploitEditor").value = ""
    document.querySelectorAll(".platform-option").forEach((option) => {
      option.classList.remove("selected")
    })

    document.getElementById("priceFree").checked = true
    document.getElementById("pricePaid").checked = false
    document.getElementById("priceInputs").style.display = "none"
    document.getElementById("priceAmount").value = ""
    document.getElementById("pricePeriod").value = "lifetime"
    document.getElementById("editProsList").innerHTML = ""
    document.getElementById("editNeutralList").innerHTML = ""
    document.getElementById("editConsList").innerHTML = ""
    addItemRow("editProsList")
    addItemRow("editNeutralList")
    addItemRow("editConsList")
    updateUI()
  }
  
  function saveChanges() {
    if (!currentProgram) return
    const index = expData.findIndex((p) => p.id === currentProgram.id)
    if (index !== -1) {
      const name = document.getElementById("exploitName").value
      const desc = document.getElementById("exploitDesc").value
      const info = document.getElementById("exploitInfo").value
      const websiteUrl = document.getElementById("websiteUrl").value
      const priceUrl = document.getElementById("priceUrl").value
      const verified = document.getElementById("verifiedFlag").checked
      const premium = document.getElementById("premiumFlag").checked
      const hide = document.getElementById("hideFlag").checked

      const selectedPlatforms = []
      document.querySelectorAll("#platformOptions .platform-option.selected").forEach((option) => {
        selectedPlatforms.push(option.dataset.platform)
      })

      let priceValue = "FREE"
      let periodValue = null
  
      if (document.getElementById("pricePaid").checked) {
        const amount = document.getElementById("priceAmount").value
        priceValue = `$${amount}`
        periodValue = document.getElementById("pricePeriod").value
        if (periodValue === "lifetime") {
          periodValue = null
        }
      }
      const level = Number.parseInt(document.getElementById("exploitLevel").value)
      const editor = document.getElementById("exploitEditor").value
      const pros = getAttributesFromList("editProsList")
      const neutral = getAttributesFromList("editNeutralList")
      const cons = getAttributesFromList("editConsList")
      expData[index].name = name
      expData[index].desc = desc
      expData[index].info = info
      expData[index].href = websiteUrl
      expData[index].priceHref = priceUrl
      expData[index].verified = verified
      expData[index].premium = premium
      expData[index].hide = hide
      expData[index].plat = selectedPlatforms
      expData[index].price = priceValue
      expData[index].lvl = level
      expData[index].editor = editor
      expData[index].pros = pros
      expData[index].neutral = neutral
      expData[index].cons = cons
      if (periodValue) {
        expData[index].period = periodValue
      } else if (expData[index].period) {
        delete expData[index].period
      }
      currentProgram = expData[index]
      updateUI()
      updateProgramItem(currentProgram)
      updateStats()
      saveToLocalStorage()
    }
  }

  function updateProgramItem(program) {
    const programItem = document.querySelector(`.program-item[data-id="${program.id}"]`)
    if (!programItem) return
  
    let badges = ""
    if (program.verified) {
      badges += '<span class="badge badge-verified">Verified</span>'
    }
    if (program.premium) {
      badges += '<span class="badge badge-premium">Premium</span>'
    }
    if (program.hide) {
      badges += '<span class="badge badge-hidden">Hidden</span>'
    }

    const checkbox = programItem.querySelector(".program-checkbox")
    const isChecked = checkbox ? checkbox.checked : false
    programItem.innerHTML = `
      <label class="custom-checkbox program-item-checkbox">
        <input type="checkbox" class="custom-checkbox-input program-checkbox" data-id="${program.id}" ${isChecked ? "checked" : ""}>
        <span class="custom-checkbox-mark"></span>
      </label>
      <div>
        <div class="program-item-name">${program.name} ${badges}</div>
        <div class="program-item-desc">${program.desc || ""}</div>
      </div>
    `
  
    programItem.addEventListener("click", (e) => {
      if (!e.target.closest(".custom-checkbox")) {
        selectProgramItem(program.id)
      }
    })

    programItem.addEventListener("dblclick", (e) => {
      if (!e.target.closest(".custom-checkbox")) {
        selectSingleProgram(program.id)
      }
    })
  
    const newCheckbox = programItem.querySelector(".program-checkbox")
    newCheckbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        if (!selectedPrograms.includes(program.id)) {
          selectedPrograms.push(program.id)
        }
        currentProgram = program
        updateFormFields(program)
      } else {
        selectedPrograms = selectedPrograms.filter((id) => id !== program.id)
        if (currentProgram && currentProgram.id === program.id) {
          currentProgram = selectedPrograms.length > 0 ? expData.find((p) => p.id === selectedPrograms[0]) : null
  
          if (currentProgram) {
            updateFormFields(currentProgram)
          } else {
            clearForm()
          }
        }
      }
  
      updateProgramSelection()
    })
  }

  function resetToOriginal() {
    if (!currentProgram) return

    const originalProgram = expData.find((p) => p.id === currentProgram.id)
    if (!originalProgram) return

    updateFormFields(originalProgram)
  }

  function exportSelectedData() {
    if (!currentProgram) return
    const jsData = `const expData = ${JSON.stringify(currentProgram, null, 2)};`

    const blob = new Blob([jsData], { type: "application/javascript" })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${currentProgram.id}.js`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    notify(`Exported ${currentProgram.name}`)
  }
  function exportAllData() {
    const jsData = `const expdata = ${JSON.stringify({ expData: expData, deletedPrograms: deletedPrograms }, null, 2)};`
  
    const blob = new Blob([jsData], { type: "application/javascript" })
  
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "expData.js"
  
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  
    notify("Exported all data")
  }
  

  function copySelectedData() {
    if (!currentProgram) return
    const jsOutput = `  {
      id: "${currentProgram.id}",
      name: "${currentProgram.name}",
      desc: "${currentProgram.desc}",
      lvl: ${currentProgram.lvl},
      price: "${currentProgram.price}",
      ${
        currentProgram.period
          ? `period: "${currentProgram.period}",
      `
          : ""
      }plat: [${currentProgram.plat.map((p) => `"${p}"`).join(", ")}],
      pros: [${currentProgram.pros.map((p) => `"${p}"`).join(", ")}],
      neutral: [${currentProgram.neutral.map((n) => `"${n}"`).join(", ")}],
      cons: [${currentProgram.cons.map((c) => `"${c}"`).join(", ")}],
      verified: ${currentProgram.verified},
      editor: "${currentProgram.editor}",
      txtColor: "${currentProgram.txtColor}",
      accentColor: "${currentProgram.accentColor}",
      ${
        currentProgram.info
          ? `info: ${JSON.stringify(currentProgram.info)},
      `
          : ""
      }premium: ${currentProgram.premium},
      href: "${currentProgram.href}",
      priceHref: "${currentProgram.priceHref}",
      hide: ${currentProgram.hide},
    }`

    navigator.clipboard.writeText(jsOutput).then(() => {
      notify("Copied to clipboard!")
    })
  }

  function notify(message, type = "success") {
    const notification = document.getElementById("copyNotification")
    const notificationText = document.getElementById("notificationText")
    notificationText.textContent = message
    notification.className = "copy-notification"
    notification.classList.add(`notification-${type}`)
    notification.classList.add("show")
    setTimeout(() => {
      notification.classList.remove("show")
    }, 3000)
  }
  document.addEventListener("DOMContentLoaded", initializeUI)
  
  
