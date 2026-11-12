import type { Lesson } from "../../types";

// Content revision 2. These lessons extend the published networking course with
// the computing foundations that Curriculum 3.0 places before deeper networking.
// Published lesson IDs, quiz IDs and lab IDs are never renamed.
const howComputersWork: Lesson = {
  id: "how-computers-work",
  number: 4,
  title: "How Computers Work",
  zh: "计算机如何工作",
  description:
    "Follow one instruction from memory to result, and learn why speed is a chain of trade-offs.",
  minutes: 55,
  available: true,
  introducedIn: 2,
  category: "计算机基础",
  brief: {
    prerequisites: [
      "You can open an application, save a file and find it again. No programming experience is required.",
      "You have seen a slow computer before. This lesson replaces guessing with measurement.",
      "Lesson 1 is useful background, but no networking knowledge is required here.",
    ],
    technicalGoals: [
      "Trace the fetch, decode and execute steps of one machine instruction.",
      "Explain why registers, cache, RAM and storage form a hierarchy instead of one pool of memory.",
      "Decide whether a slow task is limited by the CPU, memory or storage, and say which evidence supports the claim.",
      "Distinguish a program stored on disk from the process that runs in memory.",
    ],
    englishGoals: [
      "Use instruction, register and execute as precise technical nouns and verbs.",
      "Read an English performance sentence such as 'the workload is memory-bound' and state what it excludes.",
      "Explain cause and evidence with because, whereas and therefore.",
    ],
    completion:
      "完成标准：用一条指令的执行过程解释「打开程序」到底发生了什么，并用 CPU、内存、磁盘三类证据判断一个慢场景的瓶颈。",
  },
  objectives: [
    "Describe the fetch-decode-execute cycle in your own words.",
    "Explain why RAM is faster than an SSD but loses its contents when power is off.",
    "Use Task Manager evidence to classify a slow task as CPU-bound, memory-bound or I/O-bound.",
  ],
  sections: [
    {
      id: "hsw-case-study",
      title: "A slow laptop is a clue, not a diagnosis",
      text: "At 09:10, Ada opens twelve browser tabs and joins a video call. The fan becomes loud, the cursor lags, and the call freezes for two seconds. She concludes that the internet is slow. Her colleague opens Task Manager and reads a different story: the CPU is at 96%, memory is at 91%, the disk is busy 100% of the time, and the network is almost idle.\n\nThe same symptom can come from four different resources. A CPU-bound task waits for computation. A memory-bound task waits because data does not fit in RAM and the system swaps to disk. An I/O-bound task waits for storage or network. A network-bound task waits for packets. Each explanation predicts a different measurement, so the measurement should come before the purchase.\n\nThis lesson builds the model behind those four words. It is not a tour of hardware names. It is a way to predict which resource will become the bottleneck when you change a program, a file size or a machine.",
    },
    {
      id: "hsw-instruction-cycle",
      title: "The fetch-decode-execute cycle",
      text: "A modern computer is a stored-program machine. Memory holds both instructions and data, and the CPU does not know the difference until it interprets a value. A special register called the program counter (PC) holds the address of the next instruction. The CPU fetches the instruction at that address, decodes its operation and operands, executes the operation, and writes a result back to a register or to memory.\n\nConsider three instructions. LOAD copies a value from memory into a register. ADD adds two values. STORE writes a register back to memory. A program that adds two numbers is a short list of such instructions plus a HALT marker. The arithmetic logic unit (ALU) performs the addition, while registers hold the values that are being worked on right now.\n\nThe clock is a rhythm, not a speed limit on its own. A 3 GHz CPU can start roughly three billion cycles per second, but one instruction may need several cycles, and a memory read can need hundreds. Modern processors also overlap instructions in a pipeline, so several are in flight at once. 'One instruction at a time' is a useful teaching model, not a literal description of the hardware.",
    },
    {
      id: "hsw-memory-hierarchy",
      title: "Why memory is a hierarchy, not one bucket",
      text: "Registers are the fastest storage and hold only a few values. Small caches sit beside each CPU core and keep recently used data close. RAM is larger and slower, and an SSD or hard disk is much larger and much slower again. The exact numbers change every year, but the order of magnitude does not: registers and cache are nanoseconds, RAM is tens to hundreds of nanoseconds, an SSD is tens of microseconds, and a spinning disk is milliseconds.\n\nA cache exists because programs reuse data. If a loop reads the same array many times, keeping part of it in cache avoids repeated trips to RAM. This is called locality: temporal locality means the same value is used again soon, and spatial locality means nearby addresses are used together. Cache lines move data in blocks, not one byte at a time.\n\nRAM is volatile: it loses its contents when power is removed. An SSD keeps data without power, but it is not a backup. A file can be deleted, a disk can fail, and a laptop can be lost. The hierarchy explains speed, not safety.",
    },
    {
      id: "hsw-data-flow",
      title: "From keystroke to pixels",
      text: "When you press a key, a controller reports an event, the operating system delivers it to the focused application, and the application updates memory. The CPU runs the code that reacts, and the graphics processor (GPU) draws the new frame. A network packet follows a similar path through a network interface and a device driver. In each case, data moves between a device and memory before software can use it.\n\nMemory is byte-addressable. Every byte has an address, and a value such as the letter A is stored as a number using an encoding such as UTF-8. A text file is therefore bytes plus an agreed interpretation. This is why a file can look like gibberish in the wrong program: the bytes are intact, but the interpretation is wrong.\n\nMany devices write directly into memory with direct memory access (DMA), so the CPU does not copy every byte itself. That improves throughput, but it also means a buggy driver can corrupt memory. The abstraction is clean only while the implementation is correct.",
    },
    {
      id: "hsw-program-run",
      title: "What actually happens when you open an app",
      text: "The icon is not the program. The program is an executable file on storage, containing machine code and data. When you open it, the operating system's loader maps the file into a new process, assigns an address space, and starts execution at an entry point. The process then has code, initialized data, a heap for dynamic allocation and a stack for function calls.\n\nMost software is written in a higher-level language and translated before it runs. A compiler translates source code into machine code ahead of time. An interpreter reads and executes a representation of the program while it runs. Some languages use both: bytecode is compiled first and then executed by a virtual machine. The distinction matters because it predicts startup time, portability and error timing.\n\nA running process is more than its code. It owns memory, open files, network connections and permissions. Two instances of the same executable are two processes with separate state. When you close a window, the program may keep running in the background, which is why 'I closed it' and 'it stopped' are different claims.",
    },
    {
      id: "hsw-performance",
      title: "Bottlenecks: CPU-bound, memory-bound, I/O-bound",
      text: "A workload is CPU-bound when the processor is the limiting resource: video encoding, compiling code, or a tight numerical loop. It is memory-bound when the working set does not fit in RAM and the machine spends time moving pages to disk. It is I/O-bound when storage or network latency dominates: copying many small files, waiting for a database, or downloading an update.\n\nThe classification is about the limiting resource, not the program's category. A video editor is CPU-bound while exporting and I/O-bound while importing footage. A browser is network-bound on a slow connection and CPU-bound on a heavy page with complex scripts. You cannot tell from the application name; you tell from the measurement.\n\nSwapping deserves special attention. When RAM is full, the operating system moves pages to disk to make room. Disk access is thousands of times slower than RAM, so the machine can appear frozen even though the CPU is mostly idle. Adding RAM helps this case; adding a faster CPU usually does not. A faster SSD helps, but it is still far slower than RAM.",
    },
    {
      id: "hsw-misconceptions",
      title: "Three expensive misconceptions",
      text: "The first misconception is that a higher clock speed always means a faster computer. Real performance depends on how many instructions a core completes per cycle, how many cores do useful work, how much cache is available and whether the cooling system can sustain the clock. A laptop that throttles under load can be slower than a lower-clocked desktop.\n\nThe second is that closing applications always frees memory for other work. Operating systems use free RAM for caching, and unused memory is wasted memory. Closing an application can help when it holds a large working set, but the number of open windows is not a measurement.\n\nThe third is that a registry cleaner or 'optimizer' makes a machine faster. At best it changes little; at worst it removes settings that software depends on. Prefer measurable actions: remove startup programs you recognize, keep free disk space, update drivers from the vendor and back up before changing system settings. A slow machine is a diagnostic problem before it is a shopping problem.",
    },
    {
      id: "hsw-summary",
      title: "What you can now explain",
      text: "You can now describe one instruction as fetch, decode, execute and write-back, and explain why the program counter matters. You can place registers, cache, RAM and storage on a speed hierarchy and say why the hierarchy exists. You can distinguish a program on disk from a process in memory, and you can classify a slow workload by its limiting resource.\n\nThe operating system is the next layer. It decides which process runs, which memory pages are resident, and which file a path refers to. The next lesson opens that layer and shows how the same hardware becomes many isolated programs.",
    },
  ],
  vocabulary: [
    {
      word: "instruction",
      zh: "指令",
      definition:
        "A single operation a processor can perform, such as loading a value or adding two numbers.",
      example:
        "The program counter holds the address of the next instruction to fetch.",
    },
    {
      word: "register",
      zh: "寄存器",
      definition:
        "A very small, very fast storage location inside the processor used for current values.",
      example: "The ADD instruction writes its result into a register.",
    },
    {
      word: "volatile",
      zh: "易失的",
      definition: "Losing stored contents when electrical power is removed.",
      example:
        "RAM is volatile, so an unsaved document disappears after a power cut.",
    },
    {
      word: "clock cycle",
      zh: "时钟周期",
      definition:
        "One tick of the processor clock that paces when work can begin.",
      example:
        "A memory read can take hundreds of clock cycles, while a register read takes one.",
    },
    {
      word: "byte",
      zh: "字节",
      definition:
        "A unit of eight bits, usually the smallest addressable unit of memory.",
      example: "Each byte of the text file has its own address in memory.",
    },
    {
      word: "compiler",
      zh: "编译器",
      definition:
        "A program that translates source code into machine code or another executable form before it runs.",
      example:
        "A compiler reports a type error before the program ever starts.",
    },
    {
      word: "bandwidth",
      zh: "带宽",
      definition:
        "The maximum amount of data a link or component can transfer per unit of time.",
      example:
        "High bandwidth does not fix high latency when many small requests are sent.",
    },
  ],
  labs: ["cpu"],
  commands: [
    {
      command: "Get-Process | Sort-Object CPU -Descending | Select-Object -First 5",
      explanation:
        "按累计 CPU 时间排序，先看是谁在消耗处理器。数字是累计值，不是瞬时占用率。",
    },
    {
      command: "Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize,FreePhysicalMemory",
      explanation:
        "查看物理内存总量与空闲量（KB）。空闲内存很少不一定异常，系统会用空闲内存做缓存。",
    },
    {
      command: "Get-PSDrive C | Select-Object Used,Free",
      explanation:
        "查看 C 盘已用与剩余空间。磁盘接近写满会显著拖慢系统与更新。",
    },
  ],
  quiz: [
    {
      id: "h1",
      prompt: "Which sequence describes how one instruction is executed?",
      options: [
        "Store, fetch, decode, execute",
        "Fetch, decode, execute, write back",
        "Decode, store, fetch, execute",
        "Execute, fetch, decode, store",
      ],
      answer: 1,
      explanation:
        "The processor fetches the instruction at the program counter, decodes it, executes it, and writes a result back to a register or memory.",
    },
    {
      id: "h2",
      prompt:
        "A machine shows 95% memory use, heavy disk activity and low CPU use. Which explanation fits best?",
      options: [
        "The CPU is the bottleneck and needs an upgrade",
        "The network is dropping packets",
        "The working set does not fit in RAM, so the system is swapping",
        "The graphics card cannot draw enough frames",
      ],
      answer: 2,
      explanation:
        "High memory use plus heavy disk traffic with low CPU use is the classic pattern of swapping pages to disk.",
    },
    {
      id: "h3",
      prompt: "Why does a cached value improve performance?",
      options: [
        "It removes the need to store data permanently",
        "It compresses the value before the CPU reads it",
        "It moves the value to a slower but larger device",
        "It keeps recently used data closer to the processor than RAM",
      ],
      answer: 3,
      explanation:
        "A cache is a small, fast copy of data that would otherwise be fetched from a slower level of the hierarchy.",
    },
    {
      id: "h4",
      prompt: "What is the difference between a program and a process?",
      options: [
        "A program is a file on storage; a process is a running instance with memory and state",
        "A process is a file on storage; a program is a running instance",
        "They are the same thing, but the process has a window",
        "A program can only run once; a process can run many times",
      ],
      answer: 0,
      explanation:
        "The executable file is the program. Loading it creates a process with its own address space, open files and state.",
    },
    {
      id: "h5",
      prompt:
        "A laptop slows down only when exporting a long video. Which resource is most likely limiting?",
      options: [
        "Network latency",
        "CPU time",
        "Disk space",
        "Screen refresh rate",
      ],
      answer: 1,
      explanation:
        "Video export is a compute-heavy task, so the processor is usually the limiting resource unless measurements show otherwise.",
    },
  ],
  exercises: [
    {
      level: "Understand",
      prompt:
        "Which statement best explains what the program counter does during execution?",
      options: [
        "It stores the result of the last addition",
        "It holds the address of the next instruction to fetch",
        "It counts how many programs are installed",
        "It measures the temperature of the CPU",
      ],
      answer: 1,
      feedback: [
        "That is the role of a destination register or memory cell, not the PC.",
        "Correct. The PC points at the next instruction, and execution advances by changing it.",
        "The PC has nothing to do with installed software or the number of programs.",
        "Temperature is measured by sensors, not by the program counter.",
      ],
    },
    {
      level: "Apply",
      prompt:
        "You edit the value in memory cell 11 and rerun the same three-instruction program. What should change?",
      options: [
        "The number of instructions executed changes",
        "The instruction set of the CPU changes",
        "The stored result changes because the ADD reads cell 11",
        "Nothing changes, because memory is read-only",
      ],
      answer: 2,
      feedback: [
        "The program still has the same instructions; only the data changes.",
        "The instruction set is fixed by the processor, not by a data value.",
        "Correct. The same instruction reads a different input, so the output changes.",
        "Memory holding data is writable; treating it as read-only contradicts the model.",
      ],
    },
    {
      level: "Reason",
      prompt:
        "A colleague says: 'The CPU is only at 20%, so the computer cannot be slow.' Why is this claim incomplete?",
      options: [
        "CPU percentage is always wrong",
        "The disk is always the bottleneck",
        "Only memory usage matters",
        "A task can wait on storage or memory while the CPU is mostly idle",
      ],
      answer: 3,
      feedback: [
        "The metric is not always wrong; it is simply one resource among several.",
        "Storage is a common bottleneck, but not automatically the cause.",
        "Memory matters, yet claiming it is the only resource repeats the same mistake.",
        "Correct. Low CPU use with high disk or memory wait still produces a slow experience.",
      ],
    },
  ],
  practice: {
    label: "WINDOWS / 实践指导",
    intro:
      "Open Task Manager or Windows Terminal and collect three measurements: CPU time, memory pressure and disk activity. Compare what you expected with what the numbers show, and write both in your notes.",
  },
};

const operatingSystemsBasics: Lesson = {
  id: "operating-systems-basics",
  number: 5,
  title: "Operating Systems Basics",
  zh: "操作系统基础",
  description:
    "See how one processor becomes many programs: processes, scheduling, memory and files.",
  minutes: 60,
  available: true,
  introducedIn: 2,
  category: "操作系统",
  brief: {
    prerequisites: [
      "You can explain the difference between a program on disk and a running program (Lesson 4).",
      "You have seen a Task Manager or Activity Monitor screen and know what a process list looks like.",
      "No Linux experience is required. The next lesson adds the command line.",
    ],
    technicalGoals: [
      "Describe the kernel as the component that mediates access to hardware and enforces isolation.",
      "Trace a process through ready, running and waiting states and explain what a scheduler optimizes.",
      "Explain how virtual memory gives each process its own address space and why swapping is slow.",
      "Read a resource dashboard and separate CPU, memory, disk and network evidence.",
    ],
    englishGoals: [
      "Use kernel, process and scheduler as nouns with precise scope.",
      "Read 'the process is waiting on I/O' and identify what is blocked and what is not.",
      "Describe a sequence with first, then, while and until.",
    ],
    completion:
      "完成标准：解释「一个 CPU 如何同时运行多个程序」，并用进程状态、调度与虚拟内存三个概念分析一次卡顿。",
  },
  objectives: [
    "Explain what the kernel does and why applications cannot touch hardware directly.",
    "Describe how a scheduler shares one CPU among many processes.",
    "Distinguish a memory leak from a slow disk using evidence.",
  ],
  sections: [
    {
      id: "osb-case-study",
      title: "Two programs, one frozen laptop",
      text: "Ben starts a build, then opens a browser to watch a video. The build stops printing. The video stutters. Task Manager shows one process using a full core, another waiting, and the disk at 100%. He closes the browser and the build continues. He concludes that the browser was 'using too much internet'.\n\nThe better explanation is resource contention. The build and the browser both wanted the same disk, and one of them held a file lock the other needed. The operating system did not fail; it made a scheduling decision that favored interactive work for a moment, and the build waited.\n\nThis lesson explains the machinery behind that decision: who gets the CPU, who owns memory, and who may open a file. Once you can name the resource, you can predict the symptom.",
    },
    {
      id: "osb-kernel",
      title: "Kernel mode and user mode",
      text: "The kernel is the part of the operating system that runs with elevated privilege. It can configure memory, talk to devices and stop a misbehaving process. Ordinary applications run in user mode, where a bad pointer crashes the program instead of the machine. The boundary is enforced by the processor, not by good manners.\n\nApplications request work through system calls: open a file, read from a socket, create a process. A system call switches into kernel mode, performs a checked operation, and returns a result. This is why an application cannot simply write to a disk sector; it asks the file system, which asks the driver.\n\nDevice drivers also run with high privilege, which is why a faulty driver can cause a system-wide crash while a faulty application usually cannot. The kernel is therefore both an abstraction layer and a security boundary. When people say 'the OS manages hardware', this is the mechanism they mean.",
    },
    {
      id: "osb-process",
      title: "Processes: programs in motion",
      text: "A process is a running instance of a program. It has an identifier (PID), an address space, a set of open files and a security context. Two instances of the same application are two processes that cannot read each other's memory unless they explicitly share it.\n\nA process moves through states. It is ready when it could run but has no CPU. It is running when a core is executing its instructions. It is waiting when it is blocked on I/O, a lock or a timer, and it is terminated when it exits. A process that is waiting does not consume CPU time, even if it is the reason the user is waiting.\n\nThreads are execution units inside a process. They share the process's memory, which makes communication cheap but makes race conditions possible. A single process can use several cores through threads, which is why 'one program' and 'one core' are not the same thing.",
    },
    {
      id: "osb-scheduling",
      title: "The scheduler decides who runs",
      text: "On a machine with more runnable processes than cores, the scheduler picks which process runs next. A time slice is the interval a process may run before the scheduler reconsiders. Preemption means the kernel can stop a running process without its cooperation, which keeps one heavy job from freezing the interface.\n\nSchedulers balance competing goals. Throughput favors finishing many jobs. Latency favors responding quickly to input. Fairness prevents starvation. A priority can express that a video call matters more than a background indexer. There is no single best policy, only a policy that fits a workload.\n\nSwitching between processes costs time: registers must be saved, memory mappings may change and caches may go cold. This is a context switch. Rapid switching improves responsiveness but reduces useful work, so the scheduler tries to switch often enough without switching constantly.",
    },
    {
      id: "osb-memory",
      title: "Virtual memory and the illusion of space",
      text: "Each process sees its own virtual address space, as if it owned all of memory. The kernel and the memory management unit translate virtual addresses to physical frames using page tables. Pages are fixed-size blocks, commonly 4 KB. Isolation comes from this translation: a process cannot name another process's physical memory without permission.\n\nWhen a page is not resident, the processor raises a page fault and the kernel loads it from disk. If RAM is full, the kernel may evict a page to a swap file first. A page fault is normal; a storm of page faults is the thrashing that makes a machine crawl.\n\nVirtual memory also explains limits. A 32-bit process can address at most 4 GB, no matter how much RAM is installed. When the kernel cannot satisfy an allocation, it may terminate a process to protect the system, which users experience as an application disappearing without a normal error dialog.",
    },
    {
      id: "osb-filesystem",
      title: "Files are metadata plus bytes",
      text: "A file is not only its contents. The file system stores metadata: size, timestamps, owner, permissions and the block locations. A directory is a mapping from names to those records, not a container that physically holds files. This is why renaming a file inside the same file system is fast: the bytes do not move.\n\nPaths are resolved component by component from a starting point. A lock or an open handle explains the common 'file is in use' message: another process still holds a reference, and deleting the name does not always free the bytes immediately. Journaling file systems record intended changes so that a crash does not leave half-written structures.\n\nMounting attaches a file system at a directory. This is how a USB drive appears under a path and how one tree can span several devices. The abstraction is uniform; the hardware underneath is not.",
    },
    {
      id: "osb-diagnosis",
      title: "Reading a resource dashboard",
      text: "A dashboard is a set of counters, and each counter answers a different question. CPU percentage shows how much time cores spend executing, not how much work completed. Memory shows what is resident, including cache. Disk percentage shows how much time the device is busy, which can be 100% while throughput is tiny if requests are small and random. Network shows bytes and errors, not whether the server is healthy.\n\nStart with the symptom. If input lags but CPU is low, look at disk and memory waits. If a build is slow but the machine is responsive, look at the build's own CPU and I/O. If everything is slow after a driver update, suspect the driver rather than the hardware.\n\nRebooting is a legitimate diagnostic step because it clears leaked memory and stuck drivers, but it destroys evidence. Note the numbers first, then restart. A problem that returns after a reboot is a pattern; a problem that vanishes once may be a transient.",
    },
    {
      id: "osb-summary",
      title: "From windows to a shell",
      text: "You can now explain the kernel as a privileged mediator, a process as a program with state, a scheduler as a policy for sharing cores, and virtual memory as the isolation mechanism that also makes swapping possible. You can also read a dashboard without confusing one counter with a diagnosis.\n\nThe next lesson leaves the graphical interface behind. Linux exposes the same concepts through text: paths, permissions, processes and pipes. The concepts do not change; the vocabulary and the feedback become faster and more precise.",
    },
  ],
  vocabulary: [
    {
      word: "kernel",
      zh: "内核",
      definition:
        "The privileged core of an operating system that manages memory, devices and processes.",
      example:
        "The kernel enforces the boundary between user mode and privileged mode.",
    },
    {
      word: "process",
      zh: "进程",
      aliases: ["processes"],
      definition:
        "A running instance of a program with its own memory, files and state.",
      example: "Each browser tab may run in a separate process.",
    },
    {
      word: "scheduler",
      zh: "调度器",
      definition:
        "The kernel component that decides which runnable task uses a processor next.",
      example: "The scheduler gives interactive tasks a short time slice.",
    },
    {
      word: "context switch",
      zh: "上下文切换",
      definition:
        "Saving one task's execution state and restoring another's so a core can change tasks.",
      example: "Too many context switches reduce the time spent on useful work.",
    },
    {
      word: "system call",
      zh: "系统调用",
      definition:
        "A controlled request from a user program to the kernel for a privileged operation.",
      example: "Reading a file requires a system call, not direct disk access.",
    },
    {
      word: "virtual memory",
      zh: "虚拟内存",
      definition:
        "An abstraction that gives each process its own address space mapped to physical memory.",
      example:
        "Virtual memory keeps one process from reading another process's data.",
    },
    {
      word: "page table",
      zh: "页表",
      definition:
        "A per-process structure that maps virtual page numbers to physical frames.",
      example: "A page fault makes the kernel consult the page table.",
    },
  ],
  labs: ["os"],
  commands: [
    {
      command: "Get-Process | Sort-Object WS -Descending | Select-Object -First 5 Name,WS,CPU",
      explanation:
        "按工作集（WS，常驻内存）排序，查看哪些进程占用了最多物理内存。",
    },
    {
      command: "Get-CimInstance Win32_OperatingSystem | Select-Object LastBootUpTime,TotalVisibleMemorySize,FreePhysicalMemory",
      explanation:
        "记录开机时间与内存总量，用于判断「重启后是否复发」这类问题。",
    },
    {
      command: "Get-Counter '\\Processor(_Total)\\% Processor Time' -SampleInterval 1 -MaxSamples 3",
      explanation:
        "连续采样 CPU 总占用率。单次读数可能误导，趋势比一个瞬间更有价值。",
    },
  ],
  quiz: [
    {
      id: "o1",
      prompt: "What is the main role of the kernel?",
      options: [
        "To draw the user interface",
        "To mediate access to hardware and enforce isolation between processes",
        "To store files permanently",
        "To translate source code into machine code",
      ],
      answer: 1,
      explanation:
        "The kernel runs with privilege and controls memory, devices and process boundaries so applications cannot bypass them.",
    },
    {
      id: "o2",
      prompt: "A process is in the waiting state. What does that mean?",
      options: [
        "It is using a full CPU core",
        "It has finished and released its memory",
        "It is blocked on I/O, a lock or a timer and cannot use the CPU yet",
        "It has been moved to the ready queue and runs next",
      ],
      answer: 2,
      explanation:
        "Waiting means the process cannot proceed until an event completes, so it does not consume processor time.",
    },
    {
      id: "o3",
      prompt: "Why can a 32-bit process not use more than about 4 GB of memory?",
      options: [
        "The kernel reserves the rest for drivers only",
        "Its addresses are limited to 32 bits",
        "Physical RAM is always split evenly",
        "The file system refuses larger allocations",
      ],
      answer: 1,
      explanation:
        "A 32-bit address can name at most 2^32 bytes, so the address space is limited regardless of installed RAM.",
    },
    {
      id: "o4",
      prompt: "What is a context switch?",
      options: [
        "Saving one task's state and restoring another's on a core",
        "Changing the desktop background",
        "Moving a file between folders",
        "Switching a laptop from battery to power",
      ],
      answer: 0,
      explanation:
        "A context switch changes which task a core is executing, which requires saving and restoring execution state.",
    },
    {
      id: "o5",
      prompt:
        "Disk usage shows 100% while throughput is very low. Which explanation is most plausible?",
      options: [
        "The network cable is unplugged",
        "The CPU is running too many instructions",
        "The memory is completely empty",
        "Many small random requests keep the device busy without moving much data",
      ],
      answer: 3,
      explanation:
        "Busy time measures queue occupancy. Small random I/O can saturate a device while transferring little data.",
    },
  ],
  exercises: [
    {
      level: "Understand",
      prompt: "Which statement correctly separates user mode from kernel mode?",
      options: [
        "User mode can configure devices directly; kernel mode cannot",
        "Both modes have identical privileges but different names",
        "Kernel mode is slower because it has no access to memory",
        "User mode runs applications with limited privilege; kernel mode performs protected operations",
      ],
      answer: 3,
      feedback: [
        "Device configuration is exactly what user mode must not do directly.",
        "The names describe different privilege levels enforced by the processor.",
        "Kernel mode has more access, not less, and speed is not the defining difference.",
        "Correct. The processor enforces the boundary, and system calls cross it deliberately.",
      ],
    },
    {
      level: "Apply",
      prompt:
        "You run three compute-heavy jobs and one video call on a four-core machine. The call stutters. What should you check first?",
      options: [
        "Whether the scheduler is giving the call CPU time and whether all cores are saturated",
        "Whether the monitor is plugged in",
        "Whether the file system is journaled",
        "Whether the kernel was compiled with optimization",
      ],
      answer: 0,
      feedback: [
        "Correct. Saturation and scheduling policy are the plausible causes on a busy machine.",
        "The display connection does not explain audio or video stutter under CPU load.",
        "Journaling affects crash recovery, not real-time scheduling.",
        "Compilation flags are irrelevant to a running kernel's scheduling decision.",
      ],
    },
    {
      level: "Reason",
      prompt:
        "A machine slows down over several days and a reboot fixes it temporarily. Which explanation is most consistent?",
      options: [
        "The CPU is permanently broken",
        "A process is leaking memory or a driver is degrading, and the reboot clears that state",
        "The keyboard layout changed",
        "The disk has become read-only",
      ],
      answer: 1,
      feedback: [
        "Permanent hardware failure would not improve after a reboot.",
        "Correct. A temporary fix from rebooting points to accumulated runtime state.",
        "Keyboard layout has no effect on system-wide performance.",
        "A read-only disk produces errors, not a gradual slowdown that a reboot reverses.",
      ],
    },
  ],
  practice: {
    label: "WINDOWS / 实践指导",
    intro:
      "Open Task Manager, sort by memory, then by disk. Write down the top three processes and one number for each resource. After ten minutes, repeat the measurement and compare the trend instead of a single snapshot.",
  },
};

const linuxCommandLine: Lesson = {
  id: "linux-command-line",
  number: 6,
  title: "Linux and the Command Line",
  zh: "Linux 与命令行",
  description:
    "Use paths, permissions and pipes to inspect a system safely, one command at a time.",
  minutes: 65,
  available: true,
  introducedIn: 2,
  category: "Linux 与命令行",
  brief: {
    prerequisites: [
      "You can explain what a process and a file system are (Lesson 5).",
      "You have opened a terminal at least once, even if you only typed a command someone gave you.",
      "No Linux installation is required. The lab runs in the browser against a simulated file system.",
    ],
    technicalGoals: [
      "Read a prompt and determine your current directory before running a command.",
      "Resolve absolute and relative paths, including . and .., without guessing.",
      "Decode rwx permissions from ls -l and choose a safer mode than 777.",
      "Compose commands with pipes and redirection and explain where each stream goes.",
    ],
    englishGoals: [
      "Use directory, path and permission precisely instead of pointing at icons.",
      "Read error messages such as 'No such file or directory' as evidence about the path.",
      "Describe a procedure with before, after and unless.",
    ],
    completion:
      "完成标准：在模拟终端中创建目录、写入文件、读取内容并修改权限，同时用英文解释每条命令的三个部分：命令、选项、参数。",
  },
  objectives: [
    "Explain the difference between a terminal and a shell.",
    "Navigate a file system with absolute and relative paths.",
    "Use chmod to remove permissions that are not needed.",
  ],
  sections: [
    {
      id: "lin-case-study",
      title: "The server has no desktop",
      text: "A teammate sends a message: 'Run these three commands on the server, it will fix the deploy.' The first line is sudo rm -rf /var/app/cache/*. You have never seen this server. You do not know which directory you are in, whether the path exists, or what the commands will delete.\n\nOn a graphical desktop, the file manager shows where you are. On a server, the prompt and the output are the interface. The first three commands you should learn are not the powerful ones. They are pwd, ls and cd, because they answer 'where am I', 'what is here' and 'how do I move' before anything changes.\n\nThis lesson teaches the command line as a language with a small grammar: a command, its options and its arguments, reading from standard input and writing to standard output. Once the grammar is clear, unfamiliar commands become readable instead of magical.",
    },
    {
      id: "lin-shell",
      title: "Terminal, shell and the prompt",
      text: "A terminal is the window that displays text and sends your keystrokes. A shell is the program inside it that reads a command, expands it and asks the kernel to run it. Bash and zsh are common shells. The distinction matters when a command works in one shell and fails in another.\n\nThe prompt is a status line, not decoration. A typical prompt looks like student@server:~$. The part before @ is the user, the part after it is the host, the colon separates the current directory, and the final character often signals privilege: $ for a normal user and # for root. Copying a command without reading the prompt is how people run dangerous commands in the wrong place.\n\nA command line has three parts. The command is the program, options modify its behavior and usually start with a dash, and arguments name what it operates on. In ls -l /var/log, ls is the command, -l is an option, and /var/log is an argument. Commands are case-sensitive, and a command that is not found is usually a PATH problem, not a typo in the file.",
    },
    {
      id: "lin-paths",
      title: "Paths are addresses for files",
      text: "The file system is a tree that starts at the root, written as /. Your home directory is usually /home/student and is abbreviated as ~. An absolute path starts at the root, such as /etc/ssh/sshd_config. A relative path starts from your current directory, such as ../logs/app.log. The single dot means the current directory and two dots mean its parent.\n\nPath resolution is literal. If you are in /home/student and run cat notes.txt, the shell looks for /home/student/notes.txt. If you are in /var/log, the same command looks somewhere else and fails with 'No such file or directory'. The error is evidence about the resolved path, not proof that the file never existed.\n\nSpaces and special characters need quoting, because the shell splits arguments on spaces. A path with a space must be written as 'my notes.txt' or escaped. This is why a file that seems to exist can be invisible to a command: the shell passed a different argument than you intended.",
    },
    {
      id: "lin-files",
      title: "Inspecting and changing files safely",
      text: "ls lists names, ls -l adds permissions, owner, size and time, and ls -a includes hidden files whose names start with a dot. file reports the detected type, which may differ from the extension. These commands only read; they are safe to run while you build a mental map of a directory.\n\nmkdir creates a directory and mkdir -p creates missing parents. cp copies, mv moves or renames, and rm removes. These commands overwrite or delete without a recycle bin, so the safe habit is to list the target first and to quote paths that contain spaces. rm -rf removes a directory tree recursively and forcefully; it does not ask for confirmation.\n\nRedirection and pipes turn single commands into procedures. The greater-than sign writes standard output to a file and destroys the old contents; two greater-than signs append. The vertical bar sends one command's output into another command's input. echo hello > notes.txt followed by cat notes.txt is a complete, testable data flow.",
    },
    {
      id: "lin-permissions",
      title: "Permissions are a safety system",
      text: "Every file has an owner, a group and a permission set for three audiences: user, group and other. The letters r, w and x mean read, write and execute. In ls -l, the first character is the type, and the next nine characters are three groups of three permissions. A line beginning with -rw-r--r-- describes a regular file that the owner can read and write, while everyone else can only read.\n\nNumeric modes are shorthand. Each permission has a value: read is 4, write is 2 and execute is 1. Adding them gives one digit per audience, so 644 means rw-r--r-- and 600 means rw-------. chmod changes these bits. The execute bit is required for a script to run as a program, which is why copying a script can appear to break it.\n\n777 grants read, write and execute to everyone. It is popular because it makes errors disappear, and it is a bad default because it removes the protection that permissions exist to provide. Prefer the least privilege that still works: 600 for private files, 644 for shared readable files, 755 for directories and executables that must be public. Changing owner requires root, so sudo chown should be a deliberate act, not a reflex.",
    },
    {
      id: "lin-pipes",
      title: "Compose small tools",
      text: "Unix tools are small on purpose. grep filters lines, wc counts them, sort orders them, uniq removes adjacent duplicates and head shows the first few. None of them tries to do everything. A pipeline connects them: cat access.log | grep 500 | wc -l counts server errors without writing a program.\n\nStreams have numbers. Standard input is 0, standard output is 1 and standard error is 2. The greater-than sign redirects output, two greater-than signs append, and 2> redirects errors. A common mistake is to redirect output and still see errors on the screen, because errors travel on a different stream. Redirecting both requires 2>&1, and the order of redirections matters.\n\nExit status reports success. A command that finishes normally returns 0; a failure returns a nonzero value, available as $?. In a pipeline, the status usually reflects the last command unless the shell is configured with pipefail. This is why a pipeline can look successful while an earlier command failed.",
    },
    {
      id: "lin-safety",
      title: "Read before you run",
      text: "Powerful commands are not evil, but they are unforgiving. rm -rf deletes recursively without confirmation. A wildcard in the wrong directory expands to more than you expected. Piping a downloaded script into a shell executes code you have not read, with your permissions. chmod 777 removes a boundary that may be the only thing protecting a file.\n\nThe safe procedure is short. Run pwd to confirm location. Run ls on the target. Read the command from left to right and identify every argument. Prefer a dry run or a copy first. Keep backups of anything you cannot recreate. When a command comes from the internet, read it before running it, and never paste a sudo command you do not understand.\n\nErrors are information. 'Permission denied' means the permission bits or ownership blocked you, not that the file is missing. 'No such file or directory' means the resolved path does not exist, which may be a path or a working-directory problem. 'Command not found' means the shell could not find the program in PATH. Each message points at a different layer of the system.",
    },
    {
      id: "lin-summary",
      title: "From commands to systems",
      text: "You can now read a prompt, resolve a path, inspect a directory, change permissions deliberately and connect tools with pipes. Those skills transfer directly to servers, containers, CI logs and remote shells, where the graphical interface is often unavailable.\n\nNext comes process control, remote access and scripting: ps, kill, ssh and a first shell script. The browser lab in this lesson is a safe place to practise the grammar before you touch a real machine.",
    },
  ],
  vocabulary: [
    {
      word: "shell",
      zh: "命令行外壳",
      definition:
        "A program that reads commands, expands them and asks the operating system to run them.",
      example: "Bash and zsh are two common shells.",
    },
    {
      word: "terminal",
      zh: "终端",
      definition:
        "A text interface that sends keystrokes to a shell and displays its output.",
      example: "The terminal shows the prompt and the output of each command.",
    },
    {
      word: "prompt",
      zh: "命令提示符",
      definition:
        "The text a shell prints to show it is ready and to display context such as user and directory.",
      example: "A prompt ending in # usually means you are root.",
    },
    {
      word: "directory",
      zh: "目录",
      definition:
        "A file system object that maps names to files and other directories.",
      example: "The /etc directory contains system configuration files.",
    },
    {
      word: "absolute path",
      zh: "绝对路径",
      definition:
        "A path that starts at the root of the file system and does not depend on the current directory.",
      example: "/var/log/syslog is an absolute path.",
    },
    {
      word: "relative path",
      zh: "相对路径",
      definition:
        "A path interpreted from the current working directory rather than from the root.",
      example: "../notes.txt is a relative path.",
    },
    {
      word: "permission",
      zh: "权限",
      definition:
        "A rule that allows or denies reading, writing or executing a file for a user, group or others.",
      example:
        "chmod 600 changes the permission bits so group and other lose read access.",
    },
    {
      word: "pipe",
      zh: "管道",
      definition:
        "A connection that sends the output of one command into the input of another.",
      example: "The pipe in cat log | wc -l sends the file into the counter.",
    },
    {
      word: "redirection",
      zh: "重定向",
      definition:
        "Sending a command's input or output to a file or another stream instead of the terminal.",
      example: "Redirection with > replaces the file contents.",
    },
  ],
  labs: ["terminal"],
  commands: [
    {
      command: "pwd; ls -la; cd ~",
      explanation:
        "先确认位置、再列出全部文件（含隐藏文件）、最后回到主目录。三条命令都只读，适合作为登录后的第一步。",
    },
    {
      command: "mkdir -p ~/notes && echo hello > ~/notes/today.txt && cat ~/notes/today.txt",
      explanation:
        "创建目录、写入一行内容并读回验证。注意 > 会覆盖原内容，>> 才是追加。",
    },
    {
      command: "ls -l ~/notes/today.txt; chmod 600 ~/notes/today.txt; ls -l ~/notes/today.txt",
      explanation:
        "先用 ls -l 读取权限位，再用 chmod 600 去掉组和其他人的读写权限，最后复查确认变化。",
    },
  ],
  quiz: [
    {
      id: "l1",
      prompt: "What does the shell do when you type a command?",
      options: [
        "It compiles the command into machine code and runs it on the CPU directly",
        "It parses and expands the command, then asks the operating system to execute a program",
        "It sends the command to the terminal emulator for execution",
        "It stores the command in the file system",
      ],
      answer: 1,
      explanation:
        "The shell interprets the line, expands paths and variables, then requests execution through the operating system.",
    },
    {
      id: "l2",
      prompt:
        "You are in /home/student and run cat notes.txt. Which file is read?",
      options: [
        "/notes.txt",
        "/home/notes.txt",
        "/home/student/notes.txt",
        "Whichever notes.txt the shell finds first in PATH",
      ],
      answer: 2,
      explanation:
        "A relative path is resolved from the current working directory, so notes.txt means /home/student/notes.txt.",
    },
    {
      id: "l3",
      prompt: "What does chmod 640 allow?",
      options: [
        "Owner reads and writes; group reads; others have no access",
        "Everyone reads and writes",
        "Owner executes only; others read and write",
        "Owner reads only; group writes; others execute",
      ],
      answer: 0,
      explanation:
        "6 is read plus write for the owner, 4 is read for the group, and 0 gives others no permissions.",
    },
    {
      id: "l4",
      prompt: "What does the pipe in cat access.log | grep 500 do?",
      options: [
        "Writes the grep output into access.log",
        "Runs both commands at the same time on different CPUs",
        "Sends the output of cat into the input of grep",
        "Deletes lines containing 500",
      ],
      answer: 2,
      explanation:
        "A pipe connects standard output of the left command to standard input of the right command.",
    },
    {
      id: "l5",
      prompt:
        "A command prints 'Permission denied'. What should you check first?",
      options: [
        "Whether the file exists at all",
        "Whether the permission bits and owner allow the operation",
        "Whether the terminal window is maximized",
        "Whether the shell is bash or zsh",
      ],
      answer: 1,
      explanation:
        "Permission denied means the path resolved but the access check failed, so inspect permissions and ownership.",
    },
  ],
  exercises: [
    {
      level: "Understand",
      prompt: "Which part of ls -l /var/log is the argument?",
      options: ["ls", "-l", "/var/log", "The whole line"],
      answer: 2,
      feedback: [
        "ls is the command being run.",
        "-l is an option that changes the output format.",
        "Correct. The path names what the command operates on.",
        "The whole line is a command line, not a single argument.",
      ],
    },
    {
      level: "Apply",
      prompt:
        "You want to add a line to an existing file without deleting its contents. Which operator should you use?",
      options: [">", ">>", "|", "2>"],
      answer: 1,
      feedback: [
        "A single > truncates the file before writing.",
        "Correct. >> appends to the existing content.",
        "A pipe sends output to another command, not to a file.",
        "2> redirects standard error, not normal output.",
      ],
    },
    {
      level: "Reason",
      prompt:
        "A teammate suggests chmod 777 to fix an access error. Why is that a poor default?",
      options: [
        "It makes the file read-only",
        "It only affects the owner",
        "It grants write and execute to everyone, removing the protection permissions provide",
        "It deletes the file before changing permissions",
      ],
      answer: 2,
      feedback: [
        "777 grants more access, not less.",
        "777 changes permissions for all three audiences, not only the owner.",
        "Correct. The error may disappear while the security problem grows.",
        "chmod changes metadata; it does not delete the file.",
      ],
    },
  ],
  practice: {
    label: "LINUX / 实践指导",
    intro:
      "Use WSL, a Linux virtual machine or any server you own. If you only have PowerShell, the browser lab is the safer first step: PowerShell aliases such as ls and cat exist, but flags and output differ from GNU tools. Never run a command you cannot explain.",
  },
};

export const foundationsLessons: Lesson[] = [
  howComputersWork,
  operatingSystemsBasics,
  linuxCommandLine,
];
