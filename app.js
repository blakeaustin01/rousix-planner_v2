const ACTIVATION_URL = "";

const tiers = {
  basic: {
    key: "basic",
    name: "Basic Tablet",
    fullName: "Rousix Basic Tablet",
    price: 1250,
    minimumBase: 0,
    maximumBase: 4999
  },
  standard: {
    key: "standard",
    name: "Standard",
    fullName: "Rousix Standard",
    price: 4100,
    minimumBase: 5000,
    maximumBase: 14999
  },
  standardPlus: {
    key: "standardPlus",
    name: "Standard Plus",
    fullName: "Rousix Standard Plus",
    price: 8250,
    minimumBase: 15000,
    maximumBase: 29999
  },
  premium: {
    key: "premium",
    name: "Premium",
    fullName: "Rousix Premium",
    price: 12450,
    minimumBase: 30000,
    maximumBase: 74999
  },
  titan: {
    key: "titan",
    name: "Titan",
    fullName: "Rousix Titan",
    price: 75000,
    minimumBase: 75000,
    maximumBase: 149999
  },
  colossus: {
    key: "colossus",
    name: "Colossus",
    fullName: "Rousix Colossus",
    price: 150000,
    minimumBase: 150000,
    maximumBase: 299999
  },
  olympus: {
    key: "olympus",
    name: "Olympus",
    fullName: "Rousix Olympus",
    price: 300000,
    minimumBase: 300000,
    maximumBase: Infinity
  }
};

const samples = {
  vehicle: {
    goalType: "Vehicle",
    goalName: "Family vehicle",
    price: 42000,
    startingContribution: 1000,
    monthlyContribution: 350,
    timelineMonths: 36
  },
  home: {
    goalType: "Home",
    goalName: "Starter home",
    price: 300000,
    startingContribution: 5000,
    monthlyContribution: 1528,
    timelineMonths: 36
  },
  equipment: {
    goalType: "Equipment",
    goalName: "Commercial equipment package",
    price: 85000,
    startingContribution: 1500,
    monthlyContribution: 500,
    timelineMonths: 36
  },
  business: {
    goalType: "Business Asset",
    goalName: "Business expansion",
    price: 150000,
    startingContribution: 5000,
    monthlyContribution: 900,
    timelineMonths: 36
  }
};

const $ = (id) => document.getElementById(id);

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function money(value) {
  const safe = Number.isFinite(value) ? value : 0;
  return currency.format(Math.round(safe));
}

function cleanNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

function roundUpTo(value, increment = 1) {
  if (!Number.isFinite(value)) return 0;
  return Math.ceil(value / increment) * increment;
}

function getPlanFromForm() {
  return {
    goalType: $("goalType").value,
    goalName: $("goalName").value.trim() || "Ownership goal",
    price: cleanNumber($("price").value),
    startingContribution: Math.max(cleanNumber($("startingContribution").value), 5),
    monthlyContribution: Math.max(cleanNumber($("monthlyContribution").value), 1),
    timelineMonths: cleanNumber($("timelineMonths").value) || 36
  };
}

function chooseTier(planBase) {
  const allTiers = Object.values(tiers);

  return (
    allTiers.find((tier) => planBase >= tier.minimumBase && planBase <= tier.maximumBase) ||
    tiers.standard
  );
}

function getGoalStartingMinimum(price) {
  return Math.max(5, roundUpTo(price / 60, 25));
}

function calculatePlan(plan) {
  const timelineMonths = plan.timelineMonths || 36;
  const price = Math.max(plan.price, 0);

  const fiveXBase = price / 5;
  const tenXBase = price / 10;
  const fifteenXBase = price / 15;
  const fortyXBase = price / 40;

  const suggestedTier = chooseTier(fiveXBase);
  const tenXTier = chooseTier(tenXBase);
  const fifteenXTier = chooseTier(fifteenXBase);
  const fortyXTier = chooseTier(fortyXBase);

  const startingContribution = Math.max(plan.startingContribution, 5);
  const monthlyContribution = Math.max(plan.monthlyContribution, 1);
  const monthlyTotal = monthlyContribution * timelineMonths;
  const directTotal = startingContribution + monthlyTotal;

  const goalStartingMinimum = getGoalStartingMinimum(price);
  const isStarterPlan = startingContribution < goalStartingMinimum;

  const infrastructureCost = suggestedTier.price;

  const infrastructureCoveredByStart =
    Math.min(startingContribution, infrastructureCost);

  const infrastructureRemainingAfterStart =
    Math.max(infrastructureCost - infrastructureCoveredByStart, 0);

  const infrastructureCoveredByMonthly =
    Math.min(monthlyTotal, infrastructureRemainingAfterStart);

  const infrastructureGap =
    Math.max(infrastructureCost - startingContribution - monthlyTotal, 0);

  const availablePlanBaseAfterInfrastructure =
    Math.max(directTotal - infrastructureCost, 0);

  const fiveXPlanBaseGap =
    Math.max(fiveXBase - availablePlanBaseAfterInfrastructure, 0);

  const tenXPlanBaseGap =
    Math.max(tenXBase - availablePlanBaseAfterInfrastructure, 0);

  const baseOnlyFiveXRemaining =
    Math.max(fiveXBase - startingContribution, 0);

  const baseOnlyFiveXMonthly =
    baseOnlyFiveXRemaining / timelineMonths;

  const monthlyNeededFor5xAfterInfrastructure =
    Math.max(fiveXBase + infrastructureCost - startingContribution, 0) /
    timelineMonths;

  const monthlyNeededFor10xAfterInfrastructure =
    Math.max(tenXBase + tenXTier.price - startingContribution, 0) /
    timelineMonths;

  const monthlyNeededFor15xAfterInfrastructure =
    Math.max(fifteenXBase + fifteenXTier.price - startingContribution, 0) /
    timelineMonths;

  const monthlyNeededFor40xAfterInfrastructure =
    Math.max(fortyXBase + fortyXTier.price - startingContribution, 0) /
    timelineMonths;

  const realisticGoalAt5x =
    availablePlanBaseAfterInfrastructure * 5;

  const realisticGoalAt10x =
    availablePlanBaseAfterInfrastructure * 10;

  return {
    ...plan,
    price,
    startingContribution,
    monthlyContribution,
    timelineMonths,
    fiveXBase,
    tenXBase,
    fifteenXBase,
    fortyXBase,
    suggestedTier,
    tenXTier,
    fifteenXTier,
    fortyXTier,
    monthlyTotal,
    directTotal,
    goalStartingMinimum,
    isStarterPlan,
    infrastructureCost,
    infrastructureCoveredByStart,
    infrastructureRemainingAfterStart,
    infrastructureCoveredByMonthly,
    infrastructureGap,
    availablePlanBaseAfterInfrastructure,
    fiveXPlanBaseGap,
    tenXPlanBaseGap,
    baseOnlyFiveXRemaining,
    baseOnlyFiveXMonthly,
    monthlyNeededFor5xAfterInfrastructure,
    monthlyNeededFor10xAfterInfrastructure,
    monthlyNeededFor15xAfterInfrastructure,
    monthlyNeededFor40xAfterInfrastructure,
    realisticGoalAt5x,
    realisticGoalAt10x
  };
}

function savePlan(calc) {
  localStorage.setItem("rousixPlannerPlan", JSON.stringify(calc));
}

function loadPlan() {
  const raw = localStorage.getItem("rousixPlannerPlan");

  if (!raw) {
    return calculatePlan(samples.home);
  }

  try {
    const parsed = JSON.parse(raw);
    return calculatePlan(parsed);
  } catch (error) {
    return calculatePlan(samples.home);
  }
}

function renderPlanner() {
  if (!$("plannerForm")) return;

  const plan = getPlanFromForm();
  const calc = calculatePlan(plan);

  savePlan(calc);
  updateInputGuidance(calc);

  $("resultTitle").textContent = `${calc.goalName} pathway`;

  $("simpleSummary").textContent =
    `You selected a ${calc.goalType.toLowerCase()} goal with a price of ${money(calc.price)} over ${calc.timelineMonths} months.`;

  $("directContribution").textContent =
    money(calc.directTotal);

  $("suggestedTier").textContent =
    calc.suggestedTier.name;

  $("infrastructureCost").textContent =
    money(calc.infrastructureCost);

  $("planBaseAfterInfrastructure").textContent =
    money(calc.availablePlanBaseAfterInfrastructure);

  $("fiveXBase").textContent =
    money(calc.fiveXBase);

  $("fiveXGap").textContent =
    money(calc.fiveXPlanBaseGap);

  $("baseOnlyMonthly").textContent =
    money(calc.baseOnlyFiveXMonthly);

  $("goalMinimum").textContent =
    money(calc.goalStartingMinimum);

  $("tierReason").textContent =
    "The suggested infrastructure path changes when the 5x planning base changes. The main variables are price and scenario base.";

  $("plainEnglish").textContent =
    buildPlainEnglish(calc);

  $("fiveXText").textContent =
    buildFiveXText(calc);

  $("tenXText").textContent =
    buildTenXText(calc);

  $("networkScenarioText").textContent =
    buildNetworkScenarioText(calc);

  $("starterStatus").textContent =
    buildStarterStatus(calc);

  $("tierFormula").textContent =
    buildTierFormula(calc);

  renderCompareOptions(calc, "compareGrid");

  window.currentRousixPlan = calc;
}

function updateInputGuidance(calc) {
  const startHelp = $("startingHelp");

  if (startHelp) {
    startHelp.textContent =
      `Minimum: $5. Suggested full-goal starting point for this price: ${money(calc.goalStartingMinimum)}.`;
  }

  const monthlyHelp = $("monthlyHelp");

  if (monthlyHelp) {
    monthlyHelp.textContent =
      `Minimum: $1 per month. Base-only 5x target: about ${money(calc.baseOnlyFiveXMonthly)} per month. 5x plus infrastructure: about ${money(calc.monthlyNeededFor5xAfterInfrastructure)} per month.`;
  }
}

function buildPlainEnglish(calc) {
  const startMessage = calc.isStarterPlan
    ? `Your starting contribution is below the suggested full-goal starting point of ${money(calc.goalStartingMinimum)}, so this looks more like a starter path.`
    : `Your starting contribution meets the suggested full-goal starting point of ${money(calc.goalStartingMinimum)}.`;

  if (calc.infrastructureGap > 0) {
    return (
      `You want ${calc.goalName}, priced at ${money(calc.price)}. ` +
      `A 5x example turns that into a planning base of ${money(calc.fiveXBase)}. ` +
      `The suggested infrastructure path is ${calc.suggestedTier.fullName}, shown at ${money(calc.infrastructureCost)}. ` +
      `Your total contributions over ${calc.timelineMonths} months are ${money(calc.directTotal)}. ` +
      `Those contributions do not fully cover the infrastructure amount yet. The infrastructure gap is ${money(calc.infrastructureGap)}. ` +
      `${startMessage} In simple terms: first cover the infrastructure path, then the remaining contributions can support the planning base.`
    );
  }

  return (
    `You want ${calc.goalName}, priced at ${money(calc.price)}. ` +
    `A 5x example turns that into a planning base of ${money(calc.fiveXBase)}. ` +
    `The suggested infrastructure path is ${calc.suggestedTier.fullName}, shown at ${money(calc.infrastructureCost)}. ` +
    `Your total contributions over ${calc.timelineMonths} months are ${money(calc.directTotal)}. ` +
    `After the infrastructure amount is handled, about ${money(calc.availablePlanBaseAfterInfrastructure)} remains for the planning base. ` +
    `The remaining amount to reach the 5x planning base is ${money(calc.fiveXPlanBaseGap)}. ` +
    `${startMessage}`
  );
}

function buildFiveXText(calc) {
  return (
    `For a ${money(calc.price)} goal, the 5x example is ${money(calc.price)} divided by 5, which equals ${money(calc.fiveXBase)}. ` +
    `If you start with ${money(calc.startingContribution)}, the base-only remaining amount is ${money(calc.baseOnlyFiveXRemaining)}. ` +
    `Spread over ${calc.timelineMonths} months, that is about ${money(calc.baseOnlyFiveXMonthly)} per month. ` +
    `When the ${money(calc.infrastructureCost)} infrastructure amount is included first, the monthly target becomes about ${money(calc.monthlyNeededFor5xAfterInfrastructure)}.`
  );
}

function buildTenXText(calc) {
  return (
    `For the same ${money(calc.price)} goal, the 10x example is ${money(calc.price)} divided by 10, which equals ${money(calc.tenXBase)}. ` +
    `This requires a smaller planning base than the 5x example, but it is also a more aggressive scenario. ` +
    `It helps explain the math; it does not promise a result.`
  );
}

function buildNetworkScenarioText(calc) {
  return (
    `As participation and infrastructure grow, higher-growth examples such as 15x or 40x can be compared. ` +
    `For this goal, a 15x planning base is ${money(calc.fifteenXBase)}, and a 40x planning base is ${money(calc.fortyXBase)}. ` +
    `These examples may show how a stronger network could create more flexibility or shorten a pathway, but they are not guarantees.`
  );
}

function buildStarterStatus(calc) {
  if (calc.isStarterPlan) {
    return (
      `Your starting amount is below the suggested full-goal starting point of ${money(calc.goalStartingMinimum)}. ` +
      `That can still be useful as a small beginning. It simply means this should be viewed as a starter path, not a full-goal path yet.`
    );
  }

  return (
    `Your starting amount meets the suggested full-goal starting point of ${money(calc.goalStartingMinimum)} for this price. ` +
    `The next question is whether the monthly amount supports the planning base over ${calc.timelineMonths} months.`
  );
}

function buildTierFormula(calc) {
  return (
    `The suggested path is based mainly on the 5x planning base. ` +
    `Here, ${money(calc.price)} divided by 5 equals ${money(calc.fiveXBase)}, so the planner suggests ${calc.suggestedTier.fullName}. ` +
    `If you change the price, the planning base changes. If the planning base changes enough, the infrastructure suggestion changes too.`
  );
}

function buildCompareOptions(calc) {
  const cover5xMonthly =
    roundUpTo(calc.monthlyNeededFor5xAfterInfrastructure, 25);

  const cover5xPath = calculatePlan({
    goalType: calc.goalType,
    goalName: calc.goalName,
    price: calc.price,
    startingContribution: calc.startingContribution,
    monthlyContribution: cover5xMonthly,
    timelineMonths: calc.timelineMonths
  });

  const strongerStartAmount =
    Math.max(calc.goalStartingMinimum, Math.min(calc.infrastructureCost, calc.price));

  const strongerStartMonthly =
    roundUpTo(
      Math.max(
        (calc.fiveXBase + calc.infrastructureCost - strongerStartAmount) /
          calc.timelineMonths,
        1
      ),
      25
    );

  const strongerStart = calculatePlan({
    goalType: calc.goalType,
    goalName: calc.goalName,
    price: calc.price,
    startingContribution: strongerStartAmount,
    monthlyContribution: strongerStartMonthly,
    timelineMonths: calc.timelineMonths
  });

  const starterTest = calculatePlan({
    goalType: calc.goalType,
    goalName: `Starter ${calc.goalType.toLowerCase()} test`,
    price: calc.price,
    startingContribution: Math.max(5, Math.min(calc.startingContribution, 500)),
    monthlyContribution: Math.max(1, Math.min(calc.monthlyContribution, 100)),
    timelineMonths: calc.timelineMonths
  });

  const smallerGoalPrice =
    Math.max(500, roundUpTo(calc.realisticGoalAt5x, 500));

  const smallerGoal = calculatePlan({
    goalType: calc.goalType,
    goalName: `Smaller first ${calc.goalType.toLowerCase()} goal`,
    price: Math.min(calc.price, smallerGoalPrice),
    startingContribution: calc.startingContribution,
    monthlyContribution: calc.monthlyContribution,
    timelineMonths: calc.timelineMonths
  });

  const cover10xMonthly =
    roundUpTo(calc.monthlyNeededFor10xAfterInfrastructure, 25);

  const tenXPath = calculatePlan({
    goalType: calc.goalType,
    goalName: calc.goalName,
    price: calc.price,
    startingContribution: calc.startingContribution,
    monthlyContribution: cover10xMonthly,
    timelineMonths: calc.timelineMonths
  });

  const alternateTimelineMonths =
    calc.timelineMonths < 36 ? 36 : 24;

  const timelineLabel =
    calc.timelineMonths < 36 ? "Use more time" : "Faster timeline";

  const timelineMonthly =
    roundUpTo(
      Math.max(
        (calc.fiveXBase + calc.infrastructureCost - calc.startingContribution) /
          alternateTimelineMonths,
        1
      ),
      25
    );

  const timelineOption = calculatePlan({
    goalType: calc.goalType,
    goalName: calc.goalName,
    price: calc.price,
    startingContribution: calc.startingContribution,
    monthlyContribution: timelineMonthly,
    timelineMonths: alternateTimelineMonths
  });

  return [
    {
      label: "Current path",
      calc,
      description: "This shows the numbers exactly as entered.",
      note:
        calc.fiveXPlanBaseGap > 0
          ? `The 5x planning gap is ${money(calc.fiveXPlanBaseGap)}.`
          : "This path covers the 5x planning base in this example."
    },
    {
      label: "Cover the 5x base",
      calc: cover5xPath,
      description:
        "Keeps the same starting amount and adjusts the monthly amount to cover the 5x planning base after infrastructure.",
      note:
        `Monthly contribution changes to about ${money(cover5xPath.monthlyContribution)}.`
    },
    {
      label: "Stronger start",
      calc: strongerStart,
      description:
        "Uses the suggested full-goal starting point, then calculates a matching monthly amount.",
      note:
        `Starting contribution changes to ${money(strongerStart.startingContribution)}.`
    },
    {
      label: "Starter test",
      calc: starterTest,
      description:
        "Shows a smaller test path for someone who wants to start with less and learn the process.",
      note:
        "This is a trust-building path, not a full-goal path."
    },
    {
      label: "Smaller first goal",
      calc: smallerGoal,
      description:
        "Shows a smaller first goal that better fits the current contribution path.",
      note:
        `Estimated first goal: ${money(smallerGoal.price)}.`
    },
    {
      label: "10x scenario",
      calc: tenXPath,
      description:
        "Shows a more aggressive planning example. It explains the math without promising an outcome.",
      note:
        `Monthly contribution in this scenario: about ${money(tenXPath.monthlyContribution)}.`
    },
    {
      label: timelineLabel,
      calc: timelineOption,
      description:
        "Shows how the monthly amount changes when the timeline changes.",
      note:
        `${timelineOption.timelineMonths}-month version at about ${money(timelineOption.monthlyContribution)} per month.`
    }
  ];
}

function renderCompareOptions(calc, targetId) {
  const grid = $(targetId);

  if (!grid) return;

  const options = buildCompareOptions(calc);

  grid.innerHTML = "";

  options.forEach((option) => {
    const card = document.createElement("article");
    card.className = "compare-card";

    const title = document.createElement("h3");
    title.textContent = option.label;

    const description = document.createElement("p");
    description.textContent = option.description;

    const mini = document.createElement("div");
    mini.className = "compare-mini";

    mini.innerHTML = `
      <div><span>Price</span><strong>${money(option.calc.price)}</strong></div>
      <div><span>Start</span><strong>${money(option.calc.startingContribution)}</strong></div>
      <div><span>Monthly</span><strong>${money(option.calc.monthlyContribution)}</strong></div>
      <div><span>Timeline</span><strong>${option.calc.timelineMonths} mo</strong></div>
      <div><span>Infrastructure</span><strong>${money(option.calc.infrastructureCost)}</strong></div>
      <div><span>Plan base after infrastructure</span><strong>${money(option.calc.availablePlanBaseAfterInfrastructure)}</strong></div>
      <div><span>5x gap</span><strong>${money(option.calc.fiveXPlanBaseGap)}</strong></div>
    `;

    const note = document.createElement("p");
    note.className = "compare-note";
    note.textContent = option.note;

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(mini);
    card.appendChild(note);

    grid.appendChild(card);
  });
}

function bindPlanner() {
  if (!$("plannerForm")) return;

  [
    "goalType",
    "goalName",
    "price",
    "startingContribution",
    "monthlyContribution",
    "timelineMonths"
  ].forEach((id) => {
    $(id).addEventListener("input", renderPlanner);
    $(id).addEventListener("change", renderPlanner);
  });

  document.querySelectorAll(".sample-button").forEach((button) => {
    button.addEventListener("click", () => {
      const sample = samples[button.dataset.sample];

      if (!sample) return;

      $("goalType").value = sample.goalType;
      $("goalName").value = sample.goalName;
      $("price").value = sample.price;
      $("startingContribution").value = sample.startingContribution;
      $("monthlyContribution").value = sample.monthlyContribution;
      $("timelineMonths").value = sample.timelineMonths;

      renderPlanner();
    });
  });

  const copyButton = $("copySummary");

  if (copyButton) {
    copyButton.addEventListener("click", copySummary);
  }

  const saveButton = $("saveAndRoadmap");

  if (saveButton) {
    saveButton.addEventListener("click", () => {
      renderPlanner();
      window.location.href = "roadmap.html";
    });
  }

  const printButton = $("printPlan");

  if (printButton) {
    printButton.addEventListener("click", () => window.print());
  }

  renderPlanner();
}

function buildCopyText() {
  const calc = window.currentRousixPlan || loadPlan();

  return [
    "Rousix Surplus Ownership Planner",
    "--------------------------------",
    `Goal: ${calc.goalName}`,
    `Goal Type: ${calc.goalType}`,
    `Price: ${money(calc.price)}`,
    `Timeline: ${calc.timelineMonths} months`,
    `Starting Contribution: ${money(calc.startingContribution)}`,
    `Monthly Contribution: ${money(calc.monthlyContribution)}`,
    `Total Contributions: ${money(calc.directTotal)}`,
    `Suggested Infrastructure: ${calc.suggestedTier.fullName}`,
    `Infrastructure Amount: ${money(calc.infrastructureCost)}`,
    `Plan Base After Infrastructure: ${money(calc.availablePlanBaseAfterInfrastructure)}`,
    `5x Example Base: ${money(calc.fiveXBase)}`,
    `5x Gap: ${money(calc.fiveXPlanBaseGap)}`,
    `10x Example Base: ${money(calc.tenXBase)}`,
    "",
    "Plain-English Summary:",
    buildPlainEnglish(calc),
    "",
    "Clear Expectations:",
    "This planner does not promise returns, profit, appreciation, liquidity, approval, financing, payment approval, asset purchase, or ownership."
  ].join("\n");
}

async function copySummary() {
  const text = buildCopyText();

  try {
    await navigator.clipboard.writeText(text);
    showToast("Summary copied.");
  } catch (error) {
    showToast("Copy failed. Try printing instead.");
  }
}

function showToast(message) {
  const toast = $("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(window.toastTimer);

  window.toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function renderRoadmapPage() {
  if (!$("roadmapTitle")) return;

  const calc = loadPlan();

  $("roadmapTitle").textContent =
    `${calc.goalName} roadmap`;

  $("roadmapSummary").textContent =
    `${calc.goalType} goal. ${money(calc.price)} price. ${calc.timelineMonths}-month planning timeline.`;

  $("sidePrice").textContent =
    money(calc.price);

  $("sideDirect").textContent =
    money(calc.directTotal);

  $("sideInfrastructure").textContent =
    money(calc.infrastructureCost);

  $("sidePlanBase").textContent =
    money(calc.availablePlanBaseAfterInfrastructure);

  $("sideTier").textContent =
    calc.suggestedTier.name;

  $("flowGoal").textContent =
    `${calc.goalName}, priced at ${money(calc.price)}.`;

  $("flowTier").textContent =
    `${calc.suggestedTier.fullName}, shown at ${money(calc.infrastructureCost)}.`;

  $("stageOneText").textContent =
    `Choose the goal: ${calc.goalName}. The price is ${money(calc.price)}. This gives the plan a clear target.`;

  $("stageTwoText").textContent =
    `Start with ${money(calc.startingContribution)} and add ${money(calc.monthlyContribution)} per month. Over ${calc.timelineMonths} months, your total contributions are ${money(calc.directTotal)}.`;

  $("stageThreeText").textContent =
    `The suggested infrastructure path is ${calc.suggestedTier.fullName}. The ${money(calc.infrastructureCost)} infrastructure amount is handled first. After that, about ${money(calc.availablePlanBaseAfterInfrastructure)} supports the planning base.`;

  $("stageFourText").textContent =
    `The 5x planning base is ${money(calc.fiveXBase)}. The current 5x gap is ${money(calc.fiveXPlanBaseGap)}. Changing the price, timeline, starting amount, or monthly amount changes this number.`;

  $("stageFiveText").textContent =
    "A next step can be a small activation, simple onboarding, and a clear review of the pathway. Start small if you want to build trust first.";

  $("laymanExplanation").innerHTML =
    buildRoadmapExplanation(calc);

  renderCompareOptions(calc, "roadmapCompareGrid");

  const printButton = $("printRoadmap");

  if (printButton) {
    printButton.addEventListener("click", () => window.print());
  }
}

function buildRoadmapExplanation(calc) {
  return `
    <article>
      <h3>1. Your goal</h3>
      <p>
        You selected <strong>${calc.goalName}</strong>. The price is
        <strong>${money(calc.price)}</strong>. That is the target number this
        roadmap works from.
      </p>
    </article>

    <article>
      <h3>2. Your contribution</h3>
      <p>
        You start with <strong>${money(calc.startingContribution)}</strong> and
        add <strong>${money(calc.monthlyContribution)}</strong> per month for
        <strong>${calc.timelineMonths} months</strong>. That gives you
        <strong>${money(calc.directTotal)}</strong> in total planned contributions.
      </p>
    </article>

    <article>
      <h3>3. Infrastructure comes first</h3>
      <p>
        The suggested infrastructure path is <strong>${calc.suggestedTier.fullName}</strong>,
        shown at <strong>${money(calc.infrastructureCost)}</strong>. In this planner,
        that infrastructure amount is handled first. After that, the remaining
        contribution amount supports the planning base.
      </p>
    </article>

    <article>
      <h3>4. The 5x example</h3>
      <p>
        A 5x example means <strong>${money(calc.price)}</strong> divided by 5,
        which equals <strong>${money(calc.fiveXBase)}</strong>. After infrastructure,
        the current planning base is about
        <strong>${money(calc.availablePlanBaseAfterInfrastructure)}</strong>.
        The 5x gap is about <strong>${money(calc.fiveXPlanBaseGap)}</strong>.
      </p>
    </article>

    <article>
      <h3>5. The 10x example</h3>
      <p>
        A 10x example means <strong>${money(calc.price)}</strong> divided by 10,
        which equals <strong>${money(calc.tenXBase)}</strong>. This requires a smaller
        planning base than the 5x example, but it is more aggressive. It is not a promise.
      </p>
    </article>

    <article>
      <h3>6. Network effect idea</h3>
      <p>
        More participants and more infrastructure may create more utility and more
        flexibility for the overall system. A small network has less room to move.
        A larger network may have more possible pathways. This explains the concept,
        not a guaranteed result.
      </p>
    </article>

    <article>
      <h3>7. Start small or go bigger</h3>
      <p>
        If the full plan feels too large, start smaller. Build trust first. If the
        process makes sense, you can decide whether to increase the goal, increase
        the contribution, or change the timeline later.
      </p>
    </article>
  `;
}

function renderGetStartedPage() {
  if (!$("activationButton")) return;

  const calc = loadPlan();

  $("activationPlanSummary").textContent =
    `Your saved sample plan is ${calc.goalName}, priced at ${money(calc.price)}, with a ${calc.timelineMonths}-month timeline. The suggested infrastructure path is ${calc.suggestedTier.fullName}.`;

  $("activationCreditText").textContent =
    `The $1 activation can be credited toward the plan connected to ${calc.goalName}.`;

  const button = $("activationButton");

  button.addEventListener("click", (event) => {
    if (!ACTIVATION_URL) {
      event.preventDefault();
      alert("Secure activation is being prepared. Please contact Rousix to begin.");
      return;
    }

    button.href = ACTIVATION_URL;
  });
}

function init() {
  bindPlanner();
  renderRoadmapPage();
  renderGetStartedPage();

  const year = $("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }
}

document.addEventListener("DOMContentLoaded", init);
