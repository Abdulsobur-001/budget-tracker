/* =========================================
   FINTRACK ADVANCED BUDGET TRACKER
========================================= */


/* =========================================
   APPLICATION STATE
========================================= */

let transactions =
    JSON.parse(
        localStorage.getItem("fintrack_transactions")
    ) || [];

let goals =
    JSON.parse(
        localStorage.getItem("fintrack_goals")
    ) || [];

let monthlyBudget =
    Number(
        localStorage.getItem("fintrack_budget")
    ) || 200000;

let editingTransactionId = null;

let cashFlowChart = null;
let expenseChart = null;


/* =========================================
   DOM ELEMENTS
========================================= */

const transactionForm =
    document.getElementById("transactionForm");

const transactionTable =
    document.getElementById("transactionTable");

const emptyTransactions =
    document.getElementById("emptyTransactions");

const searchInput =
    document.getElementById("searchInput");

const typeFilter =
    document.getElementById("typeFilter");

const categoryFilter =
    document.getElementById("categoryFilter");

const resetFilters =
    document.getElementById("resetFilters");

const themeBtn =
    document.getElementById("themeBtn");

const goalsContainer =
    document.getElementById("goalsContainer");

const budgetModal =
    new bootstrap.Modal(
        document.getElementById("budgetModal")
    );

const transactionModal =
    new bootstrap.Modal(
        document.getElementById("transactionModal")
    );


/* =========================================
   INITIAL SETUP
========================================= */

document.getElementById("currentDate")
    .textContent =
    new Date().toLocaleDateString(
        "en-NG",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

document.getElementById("footerYear")
    .textContent =
    new Date().getFullYear();


document.getElementById("transactionDate")
    .value =
    getToday();


/* =========================================
   HELPER FUNCTIONS
========================================= */

function getToday() {

    return new Date()
        .toISOString()
        .split("T")[0];

}


function formatMoney(amount) {

    return "₦" +
        Number(amount).toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );

}


function saveData() {

    localStorage.setItem(
        "fintrack_transactions",
        JSON.stringify(transactions)
    );

    localStorage.setItem(
        "fintrack_goals",
        JSON.stringify(goals)
    );

    localStorage.setItem(
        "fintrack_budget",
        monthlyBudget
    );

}


/* =========================================
   NOTIFICATIONS
========================================= */

function showNotification(message) {

    document.getElementById(
        "notificationMessage"
    ).textContent = message;


    const toastElement =
        document.getElementById(
            "notification"
        );


    const toast =
        new bootstrap.Toast(
            toastElement
        );


    toast.show();

}


/* =========================================
   CALCULATE TOTALS
========================================= */

function getTotals() {

    let income = 0;
    let expenses = 0;


    transactions.forEach(
        transaction => {

            if (
                transaction.type === "income"
            ) {

                income += transaction.amount;

            } else {

                expenses += transaction.amount;

            }

        }
    );


    return {
        income,
        expenses,
        balance: income - expenses
    };

}


/* =========================================
   UPDATE DASHBOARD
========================================= */

function updateDashboard() {

    const totals =
        getTotals();


    document.getElementById(
        "income"
    ).textContent =
        formatMoney(totals.income);


    document.getElementById(
        "expenses"
    ).textContent =
        formatMoney(totals.expenses);


    document.getElementById(
        "balance"
    ).textContent =
        formatMoney(totals.balance);


    /* Expense percentage */

    let expensePercentage = 0;

    if (totals.income > 0) {

        expensePercentage =
            (totals.expenses /
                totals.income) *
            100;

    }


    document.getElementById(
        "expensePercentage"
    ).textContent =
        `${expensePercentage.toFixed(1)}% of income`;


    /* Savings */

    const savings =
        Math.max(
            totals.balance,
            0
        );


    document.getElementById(
        "savings"
    ).textContent =
        formatMoney(savings);


    let savingsRate = 0;

    if (totals.income > 0) {

        savingsRate =
            (savings /
                totals.income) *
            100;

    }


    document.getElementById(
        "savingsRate"
    ).textContent =
        `${savingsRate.toFixed(1)}% savings rate`;


    /* Balance status */

    const balanceStatus =
        document.getElementById(
            "balanceStatus"
        );


    if (totals.balance > 0) {

        balanceStatus.textContent =
            "You're in the green";

    } else if (totals.balance < 0) {

        balanceStatus.textContent =
            "You're spending more than you earn";

    } else {

        balanceStatus.textContent =
            "No balance available";

    }


    updateBudget();

    updateFinancialHealth();

    renderGoals();

    renderTransactions();

    updateCharts();

}


/* =========================================
   ADD / EDIT TRANSACTION
========================================= */

transactionForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const description =
            document.getElementById(
                "description"
            ).value.trim();


        const amount =
            Number(
                document.getElementById(
                    "amount"
                ).value
            );


        const type =
            document.getElementById(
                "transactionType"
            ).value;


        const category =
            document.getElementById(
                "transactionCategory"
            ).value;


        const date =
            document.getElementById(
                "transactionDate"
            ).value;


        const note =
            document.getElementById(
                "transactionNote"
            ).value.trim();


        if (
            !description ||
            !amount ||
            !type ||
            !category ||
            !date
        ) {

            showNotification(
                "Please complete all required fields."
            );

            return;

        }


        if (editingTransactionId) {

            const transaction =
                transactions.find(
                    item =>
                        item.id ===
                        editingTransactionId
                );


            if (transaction) {

                transaction.description =
                    description;

                transaction.amount =
                    amount;

                transaction.type =
                    type;

                transaction.category =
                    category;

                transaction.date =
                    date;

                transaction.note =
                    note;

            }


            showNotification(
                "Transaction updated successfully."
            );

        } else {

            const newTransaction = {

                id: Date.now(),

                description,

                amount,

                type,

                category,

                date,

                note

            };


            transactions.push(
                newTransaction
            );


            showNotification(
                "Transaction added successfully."
            );

        }


        saveData();

        transactionForm.reset();

        document.getElementById(
            "transactionDate"
        ).value =
            getToday();


        editingTransactionId = null;


        document.getElementById(
            "transactionModalTitle"
        ).textContent =
            "Add Transaction";


        transactionModal.hide();


        updateDashboard();

    }
);


/* =========================================
   EDIT TRANSACTION
========================================= */

function editTransaction(id) {

    const transaction =
        transactions.find(
            item => item.id === id
        );


    if (!transaction) return;


    editingTransactionId = id;


    document.getElementById(
        "transactionModalTitle"
    ).textContent =
        "Edit Transaction";


    document.getElementById(
        "description"
    ).value =
        transaction.description;


    document.getElementById(
        "amount"
    ).value =
        transaction.amount;


    document.getElementById(
        "transactionType"
    ).value =
        transaction.type;


    document.getElementById(
        "transactionCategory"
    ).value =
        transaction.category;


    document.getElementById(
        "transactionDate"
    ).value =
        transaction.date;


    document.getElementById(
        "transactionNote"
    ).value =
        transaction.note || "";


    transactionModal.show();

}


/* =========================================
   DELETE TRANSACTION
========================================= */

function deleteTransaction(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this transaction?"
        );


    if (!confirmed) return;


    transactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );


    saveData();

    updateDashboard();

    showNotification(
        "Transaction deleted."
    );

}


/* =========================================
   RENDER TRANSACTIONS
========================================= */

function renderTransactions() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedType =
        typeFilter.value;


    const selectedCategory =
        categoryFilter.value;


    let filtered =
        transactions.filter(
            transaction => {

                const matchesSearch =
                    transaction.description
                        .toLowerCase()
                        .includes(search) ||
                    transaction.category
                        .toLowerCase()
                        .includes(search);


                const matchesType =
                    selectedType === "all" ||
                    transaction.type ===
                    selectedType;


                const matchesCategory =
                    selectedCategory === "all" ||
                    transaction.category ===
                    selectedCategory;


                return (
                    matchesSearch &&
                    matchesType &&
                    matchesCategory
                );

            }
        );


    filtered.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );


    transactionTable.innerHTML = "";


    if (filtered.length === 0) {

        emptyTransactions
            .classList
            .remove("d-none");

        return;

    }


    emptyTransactions
        .classList
        .add("d-none");


    filtered.forEach(
        transaction => {

            const row =
                document.createElement(
                    "tr"
                );


            const amountClass =
                transaction.type === "income"
                    ? "income-text"
                    : "expense-text";


            const sign =
                transaction.type === "income"
                    ? "+"
                    : "-";


            row.innerHTML = `

                <td>

                    <div class="transaction-title">
                        ${escapeHTML(
                            transaction.description
                        )}
                    </div>

                    ${
                        transaction.note
                            ? `
                                <div class="transaction-note">
                                    ${escapeHTML(
                                        transaction.note
                                    )}
                                </div>
                            `
                            : ""
                    }

                </td>


                <td>

                    <span class="badge text-bg-light">
                        ${escapeHTML(
                            transaction.category
                        )}
                    </span>

                </td>


                <td>
                    ${transaction.date}
                </td>


                <td>

                    ${
                        transaction.type ===
                        "income"

                            ? `
                                <span class="badge bg-success-subtle text-success">
                                    Income
                                </span>
                              `

                            : `
                                <span class="badge bg-danger-subtle text-danger">
                                    Expense
                                </span>
                              `
                    }

                </td>


                <td class="fw-bold ${amountClass}">
                    ${sign}${formatMoney(
                        transaction.amount
                    )}
                </td>


                <td>

                    <div class="btn-group">

                        <button
                            class="btn btn-sm btn-outline-primary"
                            onclick="editTransaction(${transaction.id})"
                        >
                            <i class="bi bi-pencil"></i>
                        </button>

                        <button
                            class="btn btn-sm btn-outline-danger"
                            onclick="deleteTransaction(${transaction.id})"
                        >
                            <i class="bi bi-trash"></i>
                        </button>

                    </div>

                </td>

            `;


            transactionTable.appendChild(
                row
            );

        }
    );

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* =========================================
   SEARCH / FILTER
========================================= */

searchInput.addEventListener(
    "input",
    renderTransactions
);

typeFilter.addEventListener(
    "change",
    renderTransactions
);

categoryFilter.addEventListener(
    "change",
    renderTransactions
);


resetFilters.addEventListener(
    "click",
    function() {

        searchInput.value = "";

        typeFilter.value = "all";

        categoryFilter.value = "all";

        renderTransactions();

    }
);


/* =========================================
   MONTHLY BUDGET
========================================= */

function updateBudget() {

    const now =
        new Date();


    const currentMonth =
        now.getMonth();


    const currentYear =
        now.getFullYear();


    let monthlySpent = 0;


    transactions.forEach(
        transaction => {

            const transactionDate =
                new Date(
                    transaction.date
                );


            if (
                transaction.type === "expense" &&
                transactionDate.getMonth() === currentMonth &&
                transactionDate.getFullYear() === currentYear
            ) {

                monthlySpent +=
                    transaction.amount;

            }

        }
    );


    const percentage =
        monthlyBudget > 0
            ? (monthlySpent /
                monthlyBudget) *
              100
            : 0;


    document.getElementById(
        "monthlyBudget"
    ).textContent =
        formatMoney(
            monthlyBudget
        );


    document.getElementById(
        "monthlySpent"
    ).textContent =
        formatMoney(
            monthlySpent
        );


    document.getElementById(
        "budgetProgress"
    ).style.width =
        Math.min(
            percentage,
            100
        ) + "%";


    document.getElementById(
        "budgetPercent"
    ).textContent =
        `${percentage.toFixed(1)}%`;


    const remaining =
        monthlyBudget -
        monthlySpent;


    document.getElementById(
        "budgetRemaining"
    ).textContent =
        remaining >= 0
            ? `${formatMoney(
                remaining
              )} remaining`
            : `${formatMoney(
                Math.abs(remaining)
              )} over budget`;


    const progress =
        document.getElementById(
            "budgetProgress"
        );


    if (percentage >= 100) {

        progress.className =
            "progress-bar bg-danger";

    } else if (percentage >= 80) {

        progress.className =
            "progress-bar bg-warning";

    } else {

        progress.className =
            "progress-bar bg-success";

    }

}


/* =========================================
   EDIT BUDGET
========================================= */

document.getElementById(
    "editBudgetBtn"
).addEventListener(
    "click",
    function() {

        document.getElementById(
            "budgetInput"
        ).value =
            monthlyBudget;

        budgetModal.show();

    }
);


document.getElementById(
    "saveBudgetBtn"
).addEventListener(
    "click",
    function() {

        const value =
            Number(
                document.getElementById(
                    "budgetInput"
                ).value
            );


        if (value <= 0) {

            showNotification(
                "Enter a valid budget."
            );

            return;

        }


        monthlyBudget =
            value;


        saveData();

        budgetModal.hide();

        updateDashboard();

        showNotification(
            "Monthly budget updated."
        );

    }
);


/* =========================================
   SAVINGS GOALS
========================================= */

document.getElementById(
    "goalForm"
).addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const name =
            document.getElementById(
                "goalName"
            ).value.trim();


        const target =
            Number(
                document.getElementById(
                    "goalTarget"
                ).value
            );


        if (!name || target <= 0) {

            showNotification(
                "Enter a valid savings goal."
            );

            return;

        }


        goals.push({

            id: Date.now(),

            name,

            target,

            saved: 0

        });


        saveData();

        document.getElementById(
            "goalForm"
        ).reset();


        bootstrap.Modal.getInstance(
            document.getElementById(
                "goalModal"
            )
        ).hide();


        renderGoals();

        showNotification(
            "Savings goal created."
        );

    }
);


/* =========================================
   RENDER GOALS
========================================= */

function renderGoals() {

    goalsContainer.innerHTML = "";


    if (goals.length === 0) {

        goalsContainer.innerHTML = `

            <div class="col-12">

                <div class="empty-state py-4">

                    <i class="bi bi-bullseye fs-1"></i>

                    <p class="mt-3 mb-0">
                        You haven't created a savings goal yet.
                    </p>

                </div>

            </div>

        `;

        return;

    }


    goals.forEach(
        goal => {

            const percentage =
                Math.min(
                    (goal.saved /
                        goal.target) *
                    100,
                    100
                );


            const column =
                document.createElement(
                    "div"
                );


            column.className =
                "col-lg-4 col-md-6";


            column.innerHTML = `

                <div class="goal-card">

                    <div class="goal-header mb-3">

                        <div class="d-flex align-items-center gap-3">

                            <div class="goal-icon">
                                <i class="bi bi-bullseye"></i>
                            </div>

                            <div>

                                <h6 class="fw-bold mb-1">
                                    ${escapeHTML(
                                        goal.name
                                    )}
                                </h6>

                                <small class="text-muted">
                                    ${formatMoney(
                                        goal.target
                                    )} target
                                </small>

                            </div>

                        </div>


                        <button
                            class="btn btn-sm btn-outline-danger"
                            onclick="deleteGoal(${goal.id})"
                        >
                            <i class="bi bi-trash"></i>
                        </button>

                    </div>


                    <div class="d-flex justify-content-between mb-2">

                        <small>
                            Saved
                        </small>

                        <strong>
                            ${formatMoney(
                                goal.saved
                            )}
                        </strong>

                    </div>


                    <div class="progress goal-progress">

                        <div
                            class="progress-bar bg-success"
                            style="width:${percentage}%"
                        ></div>

                    </div>


                    <div class="d-flex justify-content-between mt-2">

                        <small class="text-muted">
                            ${percentage.toFixed(0)}% complete
                        </small>

                        <small class="text-muted">
                            ${formatMoney(
                                Math.max(
                                    goal.target -
                                    goal.saved,
                                    0
                                )
                            )} left
                        </small>

                    </div>


                    <button
                        class="btn btn-sm btn-success w-100 mt-3"
                        onclick="addToGoal(${goal.id})"
                    >
                        <i class="bi bi-plus-circle"></i>
                        Add Savings
                    </button>

                </div>

            `;


            goalsContainer.appendChild(
                column
            );

        }
    );

}


/* =========================================
   ADD MONEY TO GOAL
========================================= */

function addToGoal(id) {

    const goal =
        goals.find(
            item => item.id === id
        );


    if (!goal) return;


    const amount =
        Number(
            prompt(
                "How much would you like to add?"
            )
        );


    if (
        !amount ||
        amount <= 0
    ) {

        return;

    }


    goal.saved += amount;


    if (
        goal.saved >= goal.target
    ) {

        goal.saved =
            goal.target;


        showNotification(
            `🎉 You completed your ${goal.name} goal!`
        );

    } else {

        showNotification(
            "Savings added successfully."
        );

    }


    saveData();

    renderGoals();

}


/* =========================================
   DELETE GOAL
========================================= */

function deleteGoal(id) {

    if (
        !confirm(
            "Delete this savings goal?"
        )
    ) {

        return;

    }


    goals =
        goals.filter(
            goal =>
                goal.id !== id
        );


    saveData();

    renderGoals();

    showNotification(
        "Savings goal deleted."
    );

}


/* =========================================
   FINANCIAL HEALTH SCORE
========================================= */

function updateFinancialHealth() {

    const totals =
        getTotals();


    let score = 0;


    if (totals.income > 0) {

        const savingsRate =
            (
                totals.balance /
                totals.income
            ) * 100;


        if (savingsRate >= 30) {

            score += 50;

        } else if (savingsRate >= 20) {

            score += 40;

        } else if (savingsRate >= 10) {

            score += 30;

        } else if (savingsRate > 0) {

            score += 20;

        }


        const expenseRate =
            (
                totals.expenses /
                totals.income
            ) * 100;


        if (expenseRate < 50) {

            score += 50;

        } else if (expenseRate < 70) {

            score += 40;

        } else if (expenseRate < 90) {

            score += 25;

        } else if (expenseRate <= 100) {

            score += 10;

        }

    }


    document.getElementById(
        "healthScore"
    ).textContent =
        score;


    const circle =
        document.getElementById(
            "scoreCircle"
        );


    circle.style.background =
        `conic-gradient(
            ${getHealthColor(score)}
            ${score * 3.6}deg,
            #e5e7eb ${score * 3.6}deg
        )`;


    const label =
        document.getElementById(
            "healthLabel"
        );


    const message =
        document.getElementById(
            "healthMessage"
        );


    if (score >= 80) {

        label.textContent =
            "Excellent";

        message.textContent =
            "You're managing your money very well.";

    } else if (score >= 60) {

        label.textContent =
            "Good";

        message.textContent =
            "Your finances are generally healthy.";

    } else if (score >= 40) {

        label.textContent =
            "Fair";

        message.textContent =
            "Consider reducing unnecessary spending.";

    } else {

        label.textContent =
            "Needs Attention";

        message.textContent =
            "Your expenses may need closer monitoring.";

    }

}


function getHealthColor(score) {

    if (score >= 80) {

        return "#10b981";

    }

    if (score >= 60) {

        return "#22c55e";

    }

    if (score >= 40) {

        return "#f59e0b";

    }

    return "#ef4444";

}


/* =========================================
   CHARTS
========================================= */

function updateCharts() {

    updateCashFlowChart();

    updateExpenseChart();

}


/* =========================================
   CASH FLOW CHART
========================================= */

function updateCashFlowChart() {

    const months = [];

    const incomeData = [];

    const expenseData = [];


    const numberOfMonths =
        Number(
            document.getElementById(
                "chartPeriod"
            ).value
        );


    const now =
        new Date();


    for (
        let i = numberOfMonths - 1;
        i >= 0;
        i--
    ) {

        const date =
            new Date(
                now.getFullYear(),
                now.getMonth() - i,
                1
            );


        const monthName =
            date.toLocaleDateString(
                "en-US",
                {
                    month: "short"
                }
            );


        months.push(
            monthName
        );


        let income = 0;
        let expenses = 0;


        transactions.forEach(
            transaction => {

                const transactionDate =
                    new Date(
                        transaction.date
                    );


                if (
                    transactionDate.getMonth() ===
                    date.getMonth() &&
                    transactionDate.getFullYear() ===
                    date.getFullYear()
                ) {

                    if (
                        transaction.type ===
                        "income"
                    ) {

                        income +=
                            transaction.amount;

                    } else {

                        expenses +=
                            transaction.amount;

                    }

                }

            }
        );


        incomeData.push(
            income
        );

        expenseData.push(
            expenses
        );

    }


    const canvas =
        document.getElementById(
            "cashFlowChart"
        );


    if (cashFlowChart) {

        cashFlowChart.destroy();

    }


    cashFlowChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels: months,

                    datasets: [

                        {
                            label: "Income",

                            data: incomeData,

                            borderColor:
                                "#10b981",

                            backgroundColor:
                                "rgba(16,185,129,0.1)",

                            fill: true,

                            tension: 0.4

                        },

                        {
                            label: "Expenses",

                            data: expenseData,

                            borderColor:
                                "#ef4444",

                            backgroundColor:
                                "rgba(239,68,68,0.1)",

                            fill: true,

                            tension: 0.4

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    interaction: {

                        intersect: false,

                        mode: "index"

                    },

                    plugins: {

                        legend: {

                            position: "bottom"

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback: function(value) {

                                    return "₦" +
                                        value.toLocaleString();

                                }

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================
   EXPENSE CHART
========================================= */

function updateExpenseChart() {

    const categories = {};


    transactions.forEach(
        transaction => {

            if (
                transaction.type ===
                "expense"
            ) {

                if (
                    !categories[
                        transaction.category
                    ]
                ) {

                    categories[
                        transaction.category
                    ] = 0;

                }


                categories[
                    transaction.category
                ] +=
                    transaction.amount;

            }

        }
    );


    const labels =
        Object.keys(categories);


    const data =
        Object.values(categories);


    const canvas =
        document.getElementById(
            "expenseChart"
        );


    if (expenseChart) {

        expenseChart.destroy();

    }


    expenseChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels,

                    datasets: [

                        {

                            data,

                            backgroundColor: [

                                "#6366f1",
                                "#10b981",
                                "#f59e0b",
                                "#ef4444",
                                "#06b6d4",
                                "#8b5cf6",
                                "#ec4899",
                                "#14b8a6",
                                "#f97316",
                                "#64748b"

                            ],

                            borderWidth: 0

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: "bottom"

                        }

                    }

                }

            }
        );

}


/* =========================================
   CHART PERIOD
========================================= */

document.getElementById(
    "chartPeriod"
).addEventListener(
    "change",
    updateCashFlowChart
);


/* =========================================
   DARK MODE
========================================= */

themeBtn.addEventListener(
    "click",
    function() {

        document.body.classList.toggle(
            "dark-mode"
        );


        const dark =
            document.body.classList.contains(
                "dark-mode"
            );


        localStorage.setItem(
            "fintrack_dark_mode",
            dark
        );


        if (dark) {

            themeBtn.innerHTML =
                '<i class="bi bi-sun"></i>';

        } else {

            themeBtn.innerHTML =
                '<i class="bi bi-moon"></i>';

        }

    }
);


/* =========================================
   LOAD DARK MODE
========================================= */

if (
    localStorage.getItem(
        "fintrack_dark_mode"
    ) === "true"
) {

    document.body.classList.add(
        "dark-mode"
    );

    themeBtn.innerHTML =
        '<i class="bi bi-sun"></i>';

}


/* =========================================
   RESET MODAL WHEN CLOSED
========================================= */

document.getElementById(
    "transactionModal"
).addEventListener(
    "hidden.bs.modal",
    function() {

        transactionForm.reset();

        editingTransactionId = null;

        document.getElementById(
            "transactionModalTitle"
        ).textContent =
            "Add Transaction";

        document.getElementById(
            "transactionDate"
        ).value =
            getToday();

    }
);


/* =========================================
   START APPLICATION
========================================= */

updateDashboard();
