"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Cpu,
  Fan,
  Layers,
  MemoryStickIcon,
  HardDrive,
  Tv2,
  Box,
  Zap,
  ArrowLeft,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react"

// Update the guides data structure to include YouTube video URLs
const guides = {
  cpu: {
    title: "CPU Installation Guide",
    description: "Learn how to properly install a CPU without damaging pins or socket",
    icon: Cpu,
    difficulty: "Moderate",
    timeRequired: "10-15 minutes",
    tools: ["Phillips screwdriver", "Thermal paste", "Isopropyl alcohol (for cleaning)"],
    introduction:
      "Installing a CPU is one of the most critical steps in building a PC. Modern CPUs are powerful but delicate components that require careful handling. This guide will walk you through the process of installing both Intel and AMD processors safely.",
    videoUrl: "https://www.youtube.com/embed/_zojIW-2DD8",
    warnings: [
      "Never force a CPU into its socket. It should drop in with minimal pressure.",
      "Avoid touching the bottom of the CPU (pins or contacts) as oils from your skin can damage connections.",
      "Make sure your power supply is disconnected before installation.",
      "Be aware of static electricity which can damage components.",
    ],
    steps: [
      {
        title: "Prepare your workspace",
        description:
          "Clear a well-lit, static-free workspace. Ideally, work on a hard, non-carpeted surface. Consider using an anti-static wrist strap for additional protection.",
        image:
          "https://www.wikihow.com/images/thumb/c/c7/Install-a-CPU-Cooler-in-an-AMD-Motherboard-Step-2-Version-3.jpg/v4-728px-Install-a-CPU-Cooler-in-an-AMD-Motherboard-Step-2-Version-3.jpg.webp",
      },
      {
        title: "Open the CPU socket",
        description:
          "For Intel: Lift the socket lever up and then out to the side, then lift the socket cover. For AMD: Pull the lever out and up to unlock the socket.",
        image:
          "https://www.wikihow.com/images/thumb/e/e6/Install-a-CPU-Cooler-in-an-AMD-Motherboard-Step-3-Version-3.jpg/v4-728px-Install-a-CPU-Cooler-in-an-AMD-Motherboard-Step-3-Version-3.jpg.webp",
      },
      {
        title: "Align the CPU correctly",
        description:
          "Look for the alignment markers. Intel CPUs have a small triangle on one corner that aligns with a triangle on the socket. AMD CPUs have a gold triangle that aligns with a marker on the socket.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Install the CPU",
        description:
          "Gently place the CPU into the socket. It should sit flat without any pressure. Never force it - if it doesn't fit easily, check the alignment again.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Close the socket",
        description:
          "For Intel: Lower the socket cover, then push the lever down and under the retention tab. For AMD: Push the lever down until it locks into place.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Apply thermal paste",
        description:
          "Apply a small amount of thermal paste to the center of the CPU (about the size of a pea or grain of rice). The pressure from the cooler will spread it evenly.",
        image:
          "https://www.wikihow.com/images/thumb/9/90/Install-a-CPU-Cooler-in-an-AMD-Motherboard-Step-5-Version-3.jpg/v4-728px-Install-a-CPU-Cooler-in-an-AMD-Motherboard-Step-5-Version-3.jpg.webp",
      },
      {
        title: "Install the CPU cooler",
        description:
          "Follow the manufacturer's instructions to install your CPU cooler. Make sure it's firmly attached and the fan is connected to the appropriate header on the motherboard.",
        image:
          "https://www.wikihow.com/images/thumb/1/11/Install-a-CPU-Cooler-in-an-AMD-Motherboard-Step-6-Version-3.jpg/v4-728px-Install-a-CPU-Cooler-in-an-AMD-Motherboard-Step-6-Version-3.jpg.webp",
      },
    ],
    tips: [
      "If reusing a cooler, clean off old thermal paste with isopropyl alcohol before applying new paste.",
      "Different CPU generations may have different installation procedures. Always check your motherboard manual.",
      "Some high-end coolers come with pre-applied thermal paste. In this case, you don't need to add more.",
      "Make sure the CPU fan is plugged into the CPU_FAN header on the motherboard.",
    ],
    troubleshooting: [
      {
        problem: "Computer won't boot after CPU installation",
        solution: "Check that the CPU is properly seated and the power connectors to the motherboard are secure.",
      },
      {
        problem: "CPU temperatures are too high",
        solution:
          "Ensure the cooler is properly mounted and there's adequate thermal paste. Check that the CPU fan is spinning.",
      },
      {
        problem: "Bent pins on AMD CPU",
        solution:
          "Very carefully try to straighten them using a mechanical pencil with the lead removed or a credit card. Work slowly and patiently.",
      },
    ],
    relatedGuides: ["cpu-cooler", "motherboard"],
  },
  "cpu-cooler": {
    title: "CPU Cooler Installation Guide",
    description: "Properly mount air or liquid coolers for optimal thermal performance",
    icon: Fan,
    difficulty: "Moderate",
    timeRequired: "15-20 minutes",
    tools: ["Phillips screwdriver", "Thermal paste", "Isopropyl alcohol (for cleaning)"],
    introduction:
      "A properly installed CPU cooler is essential for maintaining safe operating temperatures. This guide covers installation for both air coolers and all-in-one (AIO) liquid coolers.",
    videoUrl: "https://www.youtube.com/embed/WbvKjsuznBk",
    warnings: [
      "Always handle the cooler carefully to avoid damaging the CPU.",
      "Ensure the system is powered off and unplugged before installation.",
      "Follow the specific mounting instructions for your cooler model.",
      "Don't overtighten mounting screws as this can damage the motherboard.",
    ],
    steps: [
      {
        title: "Prepare the CPU",
        description:
          "Make sure your CPU is properly installed. Clean any old thermal paste from the CPU using isopropyl alcohol and a lint-free cloth.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Apply thermal paste",
        description:
          "Apply a small amount of thermal paste to the center of the CPU (about the size of a pea or grain of rice).",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Prepare the mounting brackets",
        description:
          "Install the appropriate mounting brackets for your CPU socket type. These usually come with your cooler.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Position the cooler",
        description:
          "For air coolers: Align the cooler over the CPU. For AIO liquid coolers: Mount the radiator to your case first, then position the pump block over the CPU.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Secure the cooler",
        description:
          "Tighten the mounting screws in a diagonal pattern (like tightening a car wheel). Don't fully tighten one screw before moving to the next.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Connect the fan(s)",
        description:
          "Connect the CPU fan or pump to the CPU_FAN header on your motherboard. Connect any additional fans to available fan headers.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Check for proper mounting",
        description: "Gently try to wiggle the cooler. It should be firmly in place with no movement.",
        image: "/placeholder.svg?height=300&width=500",
      },
    ],
    tips: [
      "For AIO coolers, position the radiator so that the tubes are at the bottom if mounted vertically to prevent air bubbles from entering the pump.",
      "Consider the airflow direction when installing fans. Usually, you want air to flow from the front/bottom of the case to the rear/top.",
      "Some high-end coolers come with pre-applied thermal paste. In this case, you don't need to add more.",
      "Check your case clearance before purchasing a large air cooler.",
    ],
    troubleshooting: [
      {
        problem: "CPU temperatures are too high",
        solution:
          "Ensure the cooler is properly mounted and there's adequate thermal paste. Check that the CPU fan is spinning.",
      },
      {
        problem: "Loud or rattling noise from AIO cooler",
        solution:
          "This could be air bubbles in the pump. Try repositioning the radiator so the tubes are at the bottom.",
      },
      {
        problem: "Cooler doesn't fit in the case",
        solution:
          "Check the cooler height specifications against your case's CPU cooler clearance. You may need a lower profile cooler.",
      },
    ],
    relatedGuides: ["cpu", "case"],
  },
  motherboard: {
    title: "Motherboard Installation Guide",
    description: "Install your motherboard safely into your case with proper standoffs",
    icon: Layers,
    difficulty: "Easy",
    timeRequired: "15-20 minutes",
    tools: ["Phillips screwdriver", "Standoffs (usually included with case)"],
    introduction:
      "The motherboard is the central component of your PC build, connecting all other parts together. Proper installation is crucial for system stability and longevity.",
    videoUrl: "https://www.youtube.com/embed/XSTKVZcp5sQ",
    warnings: [
      "Always install standoffs in the correct positions to prevent shorting the motherboard.",
      "Handle the motherboard by its edges to avoid damaging components.",
      "Make sure the case is unplugged from power before installation.",
      "Be careful not to overtighten screws, which can damage the motherboard.",
    ],
    steps: [
      {
        title: "Prepare the case",
        description:
          "Install the I/O shield that came with your motherboard into the case. It should snap into place from inside the case.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Install standoffs",
        description:
          "Install brass standoffs in the case that align with the holes in your motherboard. These raise the motherboard off the case to prevent shorts.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Position the motherboard",
        description:
          "Carefully lower the motherboard into the case at an angle, lining up the I/O ports with the I/O shield first, then laying it flat on the standoffs.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Secure the motherboard",
        description:
          "Insert and tighten the screws through the motherboard into the standoffs. Don't overtighten - just until they're snug.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Connect front panel cables",
        description:
          "Connect the front panel connectors (power, reset, LED, USB, audio) to the appropriate headers on the motherboard. Check your motherboard manual for exact locations.",
        image: "/placeholder.svg?height=300&width=500",
      },
    ],
    tips: [
      "Install the CPU, RAM, and M.2 drives on the motherboard before installing it in the case.",
      "Take a photo of your motherboard connections before installation for reference.",
      "Use a magnetic screwdriver to avoid dropping screws inside the case.",
      "If the I/O shield has metal tabs, make sure they don't get pushed into the ports during installation.",
    ],
    troubleshooting: [
      {
        problem: "Motherboard doesn't align with standoffs",
        solution:
          "Double-check that you're using the correct standoff positions for your motherboard form factor (ATX, mATX, ITX).",
      },
      {
        problem: "I/O ports don't align with I/O shield",
        solution:
          "Remove the motherboard and reinstall the I/O shield, making sure it's properly seated in the case cutout.",
      },
      {
        problem: "Front panel connectors not working",
        solution:
          "Verify that the front panel connectors are plugged into the correct headers. Check your motherboard manual for the pinout.",
      },
    ],
    relatedGuides: ["cpu", "memory", "power-supply"],
  },
  memory: {
    title: "RAM Installation Guide",
    description: "Install memory modules in the correct slots for optimal performance",
    icon: MemoryStickIcon,
    difficulty: "Easy",
    timeRequired: "5-10 minutes",
    tools: [],
    introduction:
      "Installing RAM (Random Access Memory) is one of the simplest parts of building a PC. However, proper installation in the correct slots is crucial for optimal performance and stability.",
    videoUrl: "https://www.youtube.com/embed/kRMJwiXhrEU",
    warnings: [
      "Handle RAM modules by their edges to avoid touching the gold contacts.",
      "Ensure your system is powered off and unplugged before installation.",
      "Check your motherboard manual for the recommended RAM slot configuration.",
      "Don't force the RAM modules - they should click into place with moderate pressure.",
    ],
    steps: [
      {
        title: "Identify the correct RAM slots",
        description:
          "Check your motherboard manual to identify which slots to use first. For dual-channel operation with two sticks, you typically use slots 2 and 4 or 1 and 3.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Open the retention clips",
        description: "Open the retention clips at both ends of the RAM slots you'll be using.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Align the RAM module",
        description: "Align the notch on the RAM module with the key in the slot. The module can only fit one way.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Insert the RAM module",
        description:
          "Place the module vertically into the slot and press down firmly with both thumbs until the retention clips snap into place.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Verify proper installation",
        description: "Check that the retention clips are fully engaged and the module sits evenly in the slot.",
        image: "/placeholder.svg?height=300&width=500",
      },
    ],
    tips: [
      "Always install RAM in matched pairs for dual-channel operation.",
      "Check your motherboard's QVL (Qualified Vendor List) to ensure compatibility.",
      "Enable XMP/DOCP in BIOS to achieve advertised RAM speeds.",
      "If you have four RAM slots but only two modules, check your manual for the optimal configuration.",
    ],
    troubleshooting: [
      {
        problem: "System doesn't recognize all installed RAM",
        solution: "Ensure the modules are fully seated. Try reseating them or moving them to different slots.",
      },
      {
        problem: "System won't boot after RAM installation",
        solution:
          "Try with just one RAM module at a time to identify if one is faulty. Also check that you're using compatible RAM for your motherboard.",
      },
      {
        problem: "RAM running at lower speed than advertised",
        solution: "Enter BIOS and enable XMP (Intel) or DOCP/AMP (AMD) profile to run at the advertised speed.",
      },
    ],
    relatedGuides: ["motherboard"],
  },
  storage: {
    title: "Storage Installation Guide",
    description: "Mount and connect SSDs, HDDs, and M.2 drives properly",
    icon: HardDrive,
    difficulty: "Easy",
    timeRequired: "10-15 minutes",
    tools: ["Phillips screwdriver", "SATA cables (usually included with motherboard)"],
    introduction:
      'Storage drives hold your operating system, applications, and files. This guide covers installation of the three most common types: 2.5" SSDs, 3.5" HDDs, and M.2 SSDs.',
    videoUrl: "https://www.youtube.com/embed/uUk-WxBDgjw",
    warnings: [
      "Handle storage drives carefully to avoid physical damage.",
      "Ensure your system is powered off and unplugged before installation.",
      "Don't overtighten screws when mounting drives.",
      "Be careful not to bend or damage M.2 SSDs during installation.",
    ],
    steps: [
      {
        title: 'Installing a 3.5" HDD',
        description:
          "Slide the HDD into a drive bay and secure it with screws on both sides. Connect a SATA data cable from the drive to the motherboard and a power cable from the PSU.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: 'Installing a 2.5" SSD',
        description:
          'Mount the SSD in a 2.5" drive bay or adapter bracket and secure with screws. Connect a SATA data cable from the drive to the motherboard and a power cable from the PSU.',
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Installing an M.2 SSD",
        description:
          "Locate the M.2 slot on your motherboard. Insert the M.2 SSD at a 30-degree angle, then press it down and secure it with the mounting screw.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Connect SATA cables",
        description:
          "Connect SATA data cables from your drives to the SATA ports on your motherboard. Connect SATA power cables from your power supply to each drive.",
        image: "/placeholder.svg?height=300&width=500",
      },
    ],
    tips: [
      "Install your boot drive (the one that will have your operating system) on the fastest storage you have.",
      "Some M.2 slots share bandwidth with SATA ports. Check your motherboard manual to see if installing an M.2 drive disables any SATA ports.",
      "Label your SATA cables to make future maintenance easier.",
      "For best performance, connect your most frequently used drives to the lowest-numbered SATA ports.",
    ],
    troubleshooting: [
      {
        problem: "Drive not detected in BIOS or OS",
        solution:
          "Check that both power and data cables are securely connected. Try a different SATA port on the motherboard.",
      },
      {
        problem: "M.2 SSD not recognized",
        solution:
          "Verify that the M.2 slot supports your drive type (SATA or NVMe). Some motherboards only support one type in certain slots.",
      },
      {
        problem: "Slow drive performance",
        solution:
          "Ensure you're using the correct interface (SATA 3.0 for SATA SSDs, PCIe lanes for NVMe). Check that your drive isn't overheating.",
      },
    ],
    relatedGuides: ["motherboard"],
  },
  "video-card": {
    title: "Graphics Card Installation Guide",
    description: "Safely install your GPU and connect power cables correctly",
    icon: Tv2,
    difficulty: "Easy",
    timeRequired: "10-15 minutes",
    tools: ["Phillips screwdriver"],
    introduction:
      "The graphics card (GPU) is responsible for rendering images to your display. It's one of the most important components for gaming and graphics-intensive tasks. This guide will help you install it properly.",
    videoUrl: "https://www.youtube.com/embed/YVbjl69z3HE",
    warnings: [
      "Handle the graphics card by its edges to avoid damaging components.",
      "Ensure your system is powered off and unplugged before installation.",
      "Make sure your power supply has enough wattage and the correct power connectors for your GPU.",
      "Some large GPUs may require removing drive bays or other components for clearance.",
    ],
    steps: [
      {
        title: "Prepare the case",
        description:
          "Remove the appropriate PCI slot covers from the back of your case that align with the PCIe slot you'll be using.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Prepare the motherboard",
        description:
          "Locate the primary PCIe x16 slot on your motherboard (usually the top one closest to the CPU). If you have multiple GPUs, check your motherboard manual for the recommended slots.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Install the graphics card",
        description:
          "Align the GPU with the PCIe slot and press down firmly and evenly until it clicks into place. The bracket should align with the case where you removed the slot covers.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Secure the graphics card",
        description:
          "Secure the GPU bracket to the case using the screws from the PCI slot covers you removed earlier.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Connect power cables",
        description:
          "Connect the required power cables from your power supply to the GPU. Most modern GPUs require 6-pin, 8-pin, or a combination of power connectors.",
        image: "/placeholder.svg?height=300&width=500",
      },
    ],
    tips: [
      "If your GPU sags after installation, consider using a GPU support bracket to prevent long-term damage.",
      "Make sure your case has enough clearance for your GPU's length before purchasing.",
      "Some motherboards automatically switch the primary display output to the GPU when one is installed. If not, you may need to change this in BIOS.",
      "After installation, download the latest drivers from the manufacturer's website for optimal performance.",
    ],
    troubleshooting: [
      {
        problem: "No display output after installation",
        solution:
          "Ensure the monitor is connected to the GPU outputs, not the motherboard. Check that all power connectors are properly connected.",
      },
      {
        problem: "GPU fans not spinning",
        solution:
          "Many modern GPUs don't spin their fans at idle. They only start spinning under load or at certain temperatures.",
      },
      {
        problem: "System crashes or restarts during gaming",
        solution:
          "This could indicate power issues. Ensure your PSU has enough wattage for your GPU and that all power connectors are secure.",
      },
    ],
    relatedGuides: ["power-supply", "motherboard"],
  },
  case: {
    title: "PC Case Setup Guide",
    description: "Prepare your case with proper cable management and airflow",
    icon: Box,
    difficulty: "Moderate",
    timeRequired: "30-45 minutes",
    tools: ["Phillips screwdriver", "Cable ties", "Flashlight"],
    introduction:
      "The PC case houses and protects all your components while providing proper airflow. Setting up your case correctly is the foundation of a successful build and good thermal performance.",
    videoUrl: "https://www.youtube.com/embed/s1fxZ-VWs2U?si=lk9VyJvO33WY_gid&amp;start=4442",
    warnings: [
      "Be careful of sharp edges inside the case that could cut your hands or damage cables.",
      "Plan your cable management before installing components.",
      "Consider airflow direction when installing fans (intake vs exhaust).",
      "Keep the case clean and free of dust during assembly.",
    ],
    steps: [
      {
        title: "Unpack and inspect the case",
        description:
          "Remove all packaging materials and inspect the case for any damage. Remove all accessories and screws and organize them.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Install case fans",
        description:
          "Install additional case fans if needed. Generally, front and bottom fans should be intake (blowing into the case), while rear and top fans should be exhaust (blowing out of the case).",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Install the power supply",
        description:
          "Mount the power supply in its designated location, usually at the bottom or top of the case. Secure it with the provided screws.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Install the I/O shield",
        description:
          "Install the I/O shield that came with your motherboard into the rectangular cutout at the back of the case. It should snap into place from inside the case.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Install standoffs",
        description:
          "Install brass standoffs in the case that align with the holes in your motherboard. These raise the motherboard off the case to prevent shorts.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Prepare for cable management",
        description:
          "Route cables behind the motherboard tray before installing components. Plan the routing of power cables, SATA cables, and front panel connectors.",
        image: "/placeholder.svg?height=300&width=500",
      },
    ],
    tips: [
      "Install as many cables as possible before mounting the motherboard to make cable management easier.",
      "Use cable ties to bundle cables together and keep them organized.",
      "Consider the direction of airflow when planning your build - generally you want front-to-back and bottom-to-top airflow.",
      "Keep unused cables tucked away in unused drive bays or behind the motherboard tray.",
    ],
    troubleshooting: [
      {
        problem: "Not enough clearance for components",
        solution:
          "Check component dimensions against case specifications before purchasing. You may need to remove drive cages or other parts for large GPUs or radiators.",
      },
      {
        problem: "Poor airflow and high temperatures",
        solution:
          "Ensure you have enough intake and exhaust fans. Check that cables aren't blocking airflow to critical components.",
      },
      {
        problem: "Case fans not spinning",
        solution:
          "Verify that all fan connectors are properly connected to the motherboard or fan controllers. Check BIOS settings for fan control.",
      },
    ],
    relatedGuides: ["motherboard", "power-supply"],
  },
  "power-supply": {
    title: "Power Supply Installation Guide",
    description: "Install and connect your PSU with proper cable management",
    icon: Zap,
    difficulty: "Easy",
    timeRequired: "15-20 minutes",
    tools: ["Phillips screwdriver"],
    introduction:
      "The power supply unit (PSU) provides electricity to all your components. Proper installation ensures stable power delivery and system reliability.",
    videoUrl: "https://www.youtube.com/embed/7SjQo7wrWq4",
    warnings: [
      "Never open a power supply unit - internal capacitors can hold a dangerous charge even when unplugged.",
      "Ensure the PSU is switched off and unplugged during installation.",
      "Use only the cables that came with your PSU - cables from different models are not interchangeable.",
      "Make sure your PSU has enough wattage and the correct connectors for your components.",
    ],
    steps: [
      {
        title: "Determine PSU orientation",
        description:
          "Most modern cases mount the PSU at the bottom. If your case has a vent at the bottom, install the PSU with the fan facing down to draw in cool air from outside the case.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Mount the PSU",
        description:
          "Slide the PSU into position with the power socket and switch facing the back of the case. Secure it with the provided screws.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Connect the motherboard power",
        description:
          "Connect the 24-pin ATX power connector to the motherboard. Also connect the 8-pin (sometimes 4+4 pin) CPU power connector to the motherboard.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Connect GPU power",
        description:
          "Connect the required PCIe power cables to your graphics card. These are typically 6-pin or 8-pin connectors, or a combination.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Connect storage and peripherals",
        description:
          "Connect SATA or Molex power cables to your storage drives, fans, and other peripherals as needed.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Cable management",
        description:
          "Route cables behind the motherboard tray when possible. Use cable ties to bundle cables together and keep them organized.",
        image: "/placeholder.svg?height=300&width=500",
      },
    ],
    tips: [
      "Buy a PSU with some headroom above your calculated power needs for future upgrades.",
      "Modular PSUs allow you to connect only the cables you need, reducing clutter.",
      "Higher efficiency ratings (80+ Gold, Platinum, etc.) mean less heat generation and lower electricity bills.",
      "Route cables away from fans and heat-generating components for better airflow.",
    ],
    troubleshooting: [
      {
        problem: "System doesn't power on",
        solution:
          "Check that the PSU switch is turned on and the power cable is connected. Verify that the front panel power button is connected correctly to the motherboard.",
      },
      {
        problem: "System randomly restarts or shuts down",
        solution:
          "This could indicate insufficient power. Ensure your PSU has enough wattage for your components, especially during high loads.",
      },
      {
        problem: "PSU making unusual noises",
        solution:
          "Clicking, buzzing, or high-pitched whines could indicate a failing PSU. Consider replacing it immediately to prevent damage to other components.",
      },
    ],
    relatedGuides: ["case", "motherboard", "video-card"],
  },
  "full-build": {
    title: "Complete PC Build Guide",
    description: "Step-by-step guide to building a complete PC from scratch",
    icon: BookOpen,
    difficulty: "Advanced",
    timeRequired: "2-4 hours",
    tools: ["Phillips screwdriver", "Thermal paste", "Anti-static wrist strap (recommended)", "Cable ties"],
    introduction:
      "Building your own PC is a rewarding experience that gives you complete control over your components and performance. This comprehensive guide will walk you through the entire process from start to finish.",
    videoUrl: "https://www.youtube.com/embed/s1fxZ-VWs2U",
    warnings: [
      "Always work in a static-free environment and consider using an anti-static wrist strap.",
      "Never force components together - if something doesn't fit, double-check alignment.",
      "Keep track of all screws and small parts during the build process.",
      "Read the manuals for all your components before starting.",
    ],
    steps: [
      {
        title: "Prepare your workspace",
        description:
          "Clear a large, well-lit workspace. Unbox all components and verify you have everything needed. Keep manuals handy for reference.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Install CPU in motherboard",
        description:
          "Open the CPU socket, align the processor correctly (look for the alignment markers), and gently place it in. Close the socket mechanism to secure it.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Apply thermal paste and install CPU cooler",
        description:
          "Apply a small amount of thermal paste to the CPU, then install the cooler following manufacturer instructions. Connect the cooler fan to the CPU_FAN header.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Install RAM",
        description:
          "Open the RAM slot clips, align the notches, and press the modules firmly into place until the clips snap closed.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Prepare the case",
        description:
          "Install the I/O shield, add standoffs in the correct positions for your motherboard, and organize cables.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Install the motherboard",
        description:
          "Carefully lower the motherboard into the case, aligning it with the I/O shield and standoffs. Secure it with screws.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Install the power supply",
        description:
          "Mount the PSU in the designated location and secure it with screws. Route the main cables toward the motherboard.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Connect power cables",
        description: "Connect the 24-pin ATX power connector and the 8-pin CPU power connector to the motherboard.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Install storage drives",
        description:
          "Mount SSDs, HDDs, and M.2 drives in their respective locations. Connect SATA data cables to the motherboard and power cables from the PSU.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Install graphics card",
        description:
          "Remove the appropriate PCI slot covers, insert the GPU into the PCIe x16 slot, and secure it. Connect any required power cables from the PSU.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Connect front panel cables",
        description:
          "Connect the case's front panel connectors (power, reset, LED, USB, audio) to the appropriate headers on the motherboard.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Cable management",
        description:
          "Organize and secure cables using ties or velcro straps. Route cables behind the motherboard tray when possible for better airflow.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Final check",
        description:
          "Double-check all connections, ensure all components are secure, and verify no tools or loose screws are left inside the case.",
        image: "/placeholder.svg?height=300&width=500",
      },
      {
        title: "Power on and test",
        description:
          "Connect peripherals, power on the system, and enter BIOS to verify all components are recognized. Install your operating system.",
        image: "/placeholder.svg?height=300&width=500",
      },
    ],
    tips: [
      "Read all component manuals before starting the build.",
      "Install the CPU, RAM, and cooler on the motherboard before installing it in the case.",
      "Test the basic components (CPU, RAM, GPU) outside the case first to verify they work.",
      "Take your time and don't rush the process, especially if it's your first build.",
    ],
    troubleshooting: [
      {
        problem: "PC doesn't power on",
        solution:
          "Check that the power supply switch is on and all power connections are secure. Verify the front panel power button is connected correctly.",
      },
      {
        problem: "No display output",
        solution:
          "Ensure the monitor is connected to the graphics card (not the motherboard) if you have a discrete GPU. Try reseating the RAM and graphics card.",
      },
      {
        problem: "System boots but crashes or restarts",
        solution:
          "Check CPU temperatures - the cooler may not be properly mounted. Verify RAM is in the correct slots and fully seated.",
      },
      {
        problem: "Some components not recognized",
        solution: "Check all power and data connections. Update the motherboard BIOS if needed for newer components.",
      },
    ],
    relatedGuides: ["cpu", "cpu-cooler", "motherboard", "memory", "storage", "video-card", "case", "power-supply"],
  },
}

// Component for displaying warning/tip boxes
const InfoBox = ({ type, children }: { type: "warning" | "tip" | "info"; children: React.ReactNode }) => {
  const icons = {
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    tip: <CheckCircle className="h-5 w-5 text-green-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  }

  const backgrounds = {
    warning: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900",
    tip: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900",
    info: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900",
  }

  return (
    <div className={`rounded-lg border p-4 ${backgrounds[type]}`}>
      <div className="flex items-start gap-3">
        {icons[type]}
        <div>{children}</div>
      </div>
    </div>
  )
}

export default function GuidePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [guide, setGuide] = useState<any>(null)

  useEffect(() => {
    // Get guide data based on ID
    if (guides[id as keyof typeof guides]) {
      setGuide(guides[id as keyof typeof guides])
    } else {
      // Redirect to guides page if guide doesn't exist
      router.push("/guides")
    }
  }, [id, router])

  if (!guide) {
    return null // Or a loading state
  }

  const GuideIcon = guide.icon

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb and back button */}
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link href="/guides">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Guides
            </Link>
          </Button>
          <div className="text-sm text-muted-foreground">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/guides" className="hover:underline">
              Guides
            </Link>
            <span className="mx-2">/</span>
            <span>{guide.title}</span>
          </div>
        </div>

        {/* Guide header */}
        <div className="bg-card rounded-lg p-6 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <GuideIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{guide.title}</h1>
              <p className="text-muted-foreground">{guide.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">Difficulty:</div>
              <div className="text-sm">{guide.difficulty}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">Time Required:</div>
              <div className="text-sm">{guide.timeRequired}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">Tools Needed:</div>
              <div className="text-sm">{guide.tools.join(", ")}</div>
            </div>
          </div>
        </div>

        {/* Guide content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div>
            {/* Introduction */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Introduction</h2>
              <p className="text-muted-foreground">{guide.introduction}</p>

              {/* Video Tutorial */}
              {guide.videoUrl && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Video Tutorial</h3>
                  <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
                    <iframe
                      src={guide.videoUrl}
                      title={`${guide.title} Video Tutorial`}
                      className="absolute top-0 left-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

              {/* Warnings */}
              <div className="mt-4">
                <InfoBox type="warning">
                  <h3 className="font-medium mb-2">Important Warnings</h3>
                  <ul className="space-y-2">
                    {guide.warnings.map((warning: string, index: number) => (
                      <li key={index} className="text-sm">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </InfoBox>
              </div>
            </div>

            {/* Installation steps */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-6" id="steps">
                Installation Steps
              </h2>
              <div className="space-y-8">
                {guide.steps.map((step: any, index: number) => (
                  <div key={index} className="border rounded-lg overflow-hidden" id={`step-${index + 1}`}>
                    <div className="bg-muted p-4 border-b">
                      <h3 className="font-bold flex items-center">
                        <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center text-sm mr-2">
                          {index + 1}
                        </span>
                        {step.title}
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="mb-4">
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                      <div className="relative h-[300px] bg-muted rounded-lg overflow-hidden">
                        <Image src={step.image || "/placeholder.svg"} alt={step.title} fill className="object-cover" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4" id="tips">
                Tips & Best Practices
              </h2>
              <InfoBox type="tip">
                <ul className="space-y-2">
                  {guide.tips.map((tip: string, index: number) => (
                    <li key={index} className="text-sm">
                      {tip}
                    </li>
                  ))}
                </ul>
              </InfoBox>
            </div>

            {/* Troubleshooting */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4" id="troubleshooting">
                Troubleshooting
              </h2>
              <div className="space-y-4">
                {guide.troubleshooting.map((item: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">{item.problem}</h3>
                    <p className="text-sm text-muted-foreground">{item.solution}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Table of contents */}
            <div className="border rounded-lg p-4 sticky top-20">
              <h3 className="font-bold mb-3">Table of Contents</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#introduction" className="text-sm text-muted-foreground hover:text-primary">
                    Introduction
                  </a>
                </li>
                <li>
                  <a href="#steps" className="text-sm text-muted-foreground hover:text-primary">
                    Installation Steps
                  </a>
                  <ul className="ml-4 mt-2 space-y-1">
                    {guide.steps.map((step: any, index: number) => (
                      <li key={index}>
                        <a href={`#step-${index + 1}`} className="text-xs text-muted-foreground hover:text-primary">
                          {index + 1}. {step.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
                <li>
                  <a href="#tips" className="text-sm text-muted-foreground hover:text-primary">
                    Tips & Best Practices
                  </a>
                </li>
                <li>
                  <a href="#troubleshooting" className="text-sm text-muted-foreground hover:text-primary">
                    Troubleshooting
                  </a>
                </li>
              </ul>
            </div>

            {/* Related guides */}
            {guide.relatedGuides && guide.relatedGuides.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-bold mb-3">Related Guides</h3>
                <ul className="space-y-2">
                  {guide.relatedGuides.map((relatedId: string) => {
                    const relatedGuide = guides[relatedId as keyof typeof guides]
                    if (!relatedGuide) return null

                    const RelatedIcon = relatedGuide.icon

                    return (
                      <li key={relatedId}>
                        <Link
                          href={`/guides/${relatedId}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                        >
                          <RelatedIcon className="h-4 w-4" />
                          <span>{relatedGuide.title}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
