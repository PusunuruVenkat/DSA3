const $ = (id) => document.getElementById(id);


// ==================================================
// STATE
// ==================================================

let state = {

    matrixCount: 3,

    dimensions: [
        10,
        20,
        30,
        40
    ],

    step: 0,

    timer: null

};


// ==================================================
// BUILD DIMENSIONS
// ==================================================

function buildDimensions() {

    let count = Number(
        $("matrixCount").value
    );

    if (!count || count < 1) {
        count = 1;
    }

    if (count > 12) {
        count = 12;
    }

    $("matrixCount").value = count;

    state.matrixCount = count;


    // Preserve existing dimensions
    const oldDimensions =
        state.dimensions;


    state.dimensions =
        Array.from(
            {
                length: count + 1
            },
            (_, index) =>
                oldDimensions[index] || 10
        );


    const dimensionsContainer =
        $("dims");

    dimensionsContainer.innerHTML = "";


    // ==================================================
    // N MATRICES = N + 1 DIMENSIONS
    // ==================================================

    for (
        let i = 0;
        i <= count;
        i++
    ) {

        const wrapper =
            document.createElement("div");

        wrapper.className = "dim";


        const label =
            document.createElement("small");


        if (i === 0) {

            label.textContent = "ROWS";

        } else if (i === count) {

            label.textContent = "FINAL COLS";

        } else {

            label.textContent =
                "D" + i;
        }


        const input =
            document.createElement("input");

        input.type = "number";

        input.min = "1";

        input.value =
            state.dimensions[i];


        input.addEventListener(
            "input",
            function () {

                state.dimensions[i] =
                    Number(input.value) || 1;

                updateChain();

                renderMatrices();
            }
        );


        wrapper.appendChild(label);

        wrapper.appendChild(input);

        dimensionsContainer.appendChild(
            wrapper
        );
    }


    updateChain();

    renderMatrices();

    clearResults();
}


// ==================================================
// UPDATE MATRIX CHAIN
// ==================================================

function updateChain() {

    const matrices =
        Array.from(
            {
                length: state.matrixCount
            },
            (_, index) =>
                "A" + (index + 1)
        );


    $("chain").textContent =
        matrices.join(" × ");
}


// ==================================================
// GET MATRIX SIZES
// ==================================================

function getMatrixSizes() {

    return Array.from(
        {
            length: state.matrixCount
        },
        (_, index) => {

            return (
                state.dimensions[index]
                +
                "×"
                +
                state.dimensions[index + 1]
            );
        }
    );
}


// ==================================================
// RENDER EXACTLY N MATRIX CARDS
// ==================================================

function renderMatrices() {

    const stage =
        $("stage");

    stage.innerHTML = "";


    const n =
        state.matrixCount;


    const sizes =
        getMatrixSizes();


    // ==================================================
    // EXACTLY N CARDS
    //
    // 3 matrices -> A1 A2 A3
    // 5 matrices -> A1 A2 A3 A4 A5
    // ==================================================

    for (
        let i = 0;
        i < n;
        i++
    ) {

        const card =
            document.createElement("div");

        card.className = "card";

        card.id =
            "matrix-card-" + i;


        // ----------------------------------------------
        // POSITION
        // ----------------------------------------------

        const angle =
            (360 / n) * i - 90;

        const radians =
            angle * Math.PI / 180;


        const radiusX =
            Math.min(
                245,
                260 -
                Math.max(0, n - 7) * 10
            );


        const radiusY =
            Math.min(
                140,
                155 -
                Math.max(0, n - 7) * 5
            );


        const x =
            Math.cos(radians) *
            radiusX;


        const y =
            Math.sin(radians) *
            radiusY;


        const z =
            Math.sin(radians * 2) *
            35;


        card.style.transform =
            `translate3d(
                ${x}px,
                ${y}px,
                ${z}px
            )`;


        // ----------------------------------------------
        // CARD CONTENT
        // ----------------------------------------------

        card.innerHTML = `
            <b>A${i + 1}</b>

            <small>
                ${sizes[i]}
            </small>
        `;


        stage.appendChild(card);
    }


    applyAnimationStep();
}


// ==================================================
// ANIMATION
// ==================================================

function applyAnimationStep() {

    const cards =
        Array.from(
            document.querySelectorAll(".card")
        );


    const n =
        state.matrixCount;


    const maxStep =
        Math.max(1, n - 1);


    cards.forEach(
        (card, index) => {

            const angle =
                (360 / n) * index - 90;


            const radians =
                angle * Math.PI / 180;


            const radiusX =
                Math.min(
                    245,
                    260 -
                    Math.max(0, n - 7) * 10
                );


            const radiusY =
                Math.min(
                    140,
                    155 -
                    Math.max(0, n - 7) * 5
                );


            // ------------------------------------------
            // READY
            // ------------------------------------------

            if (state.step === 0) {

                card.style.opacity = "1";


                card.style.transform =
                    `translate3d(
                        ${Math.cos(radians) * radiusX}px,
                        ${Math.sin(radians) * radiusY}px,
                        ${Math.sin(radians * 2) * 35}px
                    )`;

                return;
            }


            // ------------------------------------------
            // MERGING ANIMATION
            // ------------------------------------------

            if (index <= state.step) {

                const direction =
                    index % 2 === 0
                        ? -1
                        : 1;


                card.style.opacity = "1";


                card.style.transform =
                    `translate3d(
                        ${direction * (28 + state.step * 8)}px,
                        ${(index - n / 2) * 12}px,
                        80px
                    ) scale(.88)`;

            } else {

                card.style.opacity = "0.2";
            }
        }
    );


    $("stepText").textContent =
        state.step === 0
            ? "READY"
            : `STEP ${state.step} / ${maxStep}`;
}


// ==================================================
// OPTIMIZE
// ==================================================

async function optimize() {

    $("error").textContent = "";


    const dimensions =
        state.dimensions.map(Number);


    // ==================================================
    // VALIDATION
    // ==================================================

    if (
        dimensions.length !==
        state.matrixCount + 1
    ) {

        $("error").textContent =
            `For ${state.matrixCount} matrices, `
            + `enter ${state.matrixCount + 1} dimensions.`;

        return;
    }


    if (
        dimensions.some(
            d =>
                !Number.isInteger(d) ||
                d <= 0
        )
    ) {

        $("error").textContent =
            "All dimensions must be positive integers.";

        return;
    }


    try {

        // ==================================================
        // SEND ONLY dimensions
        // Java expects:
        //
        // {
        //     "dimensions": [10,20,30,40]
        // }
        // ==================================================

        const response =
            await fetch(
                "/api/optimize",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            dimensions:
                                dimensions
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Optimization failed."
            );
        }


        // ==================================================
        // DISPLAY RESULTS
        // ==================================================

        $("optimized").textContent =
            Number(
                data.optimizedCost
            ).toLocaleString();


        $("naive").textContent =
            Number(
                data.naiveCost
            ).toLocaleString();


        $("saved").textContent =
            Number(
                data.operationsSaved
            ).toLocaleString();


        $("eff").textContent =
            Number(
                data.efficiency
            ).toFixed(2)
            + "%";


        $("parentheses").textContent =
            data.parenthesization;


        // ==================================================
        // DP TABLE
        // ==================================================

        renderDPTable(
            data.dp
        );


        state.step = 0;

        applyAnimationStep();

    }

    catch (error) {

        $("error").textContent =
            error.message;
    }
}


// ==================================================
// DP TABLE
// ==================================================

function renderDPTable(dp) {

    const n =
        state.matrixCount;


    const table =
        $("dp");

    table.innerHTML = "";


    table.style.gridTemplateColumns =
        `repeat(${n}, 58px)`;


    for (
        let i = 1;
        i <= n;
        i++
    ) {

        for (
            let j = 1;
            j <= n;
            j++
        ) {

            const cell =
                document.createElement("div");


            cell.className =
                "cell";


            // Diagonal
            if (i === j) {

                cell.classList.add(
                    "diag"
                );

                cell.textContent = "0";
            }

            // Upper triangle
            else if (j > i) {

                const value =
                    dp?.[i]?.[j];

                cell.textContent =
                    value !== undefined
                        ? Number(value).toLocaleString()
                        : "0";
            }

            // Lower triangle
            else {

                cell.textContent = "·";
            }


            table.appendChild(cell);
        }
    }
}


// ==================================================
// NEXT
// ==================================================

function nextStep() {

    const maxStep =
        Math.max(
            1,
            state.matrixCount - 1
        );


    state.step =
        Math.min(
            state.step + 1,
            maxStep
        );


    applyAnimationStep();
}


// ==================================================
// PREVIOUS
// ==================================================

function previousStep() {

    state.step =
        Math.max(
            0,
            state.step - 1
        );


    applyAnimationStep();
}


// ==================================================
// RESET
// ==================================================

function reset() {

    state.step = 0;

    stopPlaying();

    applyAnimationStep();
}


// ==================================================
// PLAY / PAUSE
// ==================================================

function togglePlay() {

    if (state.timer) {

        stopPlaying();

        return;
    }


    if (
        state.step >=
        state.matrixCount - 1
    ) {

        state.step = 0;
    }


    $("play").textContent =
        "❚❚ PAUSE";


    state.timer =
        setInterval(
            function () {

                if (
                    state.step >=
                    state.matrixCount - 1
                ) {

                    stopPlaying();

                } else {

                    nextStep();
                }

            },
            850
        );
}


// ==================================================
// STOP PLAYING
// ==================================================

function stopPlaying() {

    if (state.timer) {

        clearInterval(
            state.timer
        );

        state.timer = null;
    }


    $("play").textContent =
        "▶ PLAY";
}


// ==================================================
// CLEAR RESULTS
// ==================================================

function clearResults() {

    $("optimized").textContent = "—";

    $("naive").textContent = "—";

    $("saved").textContent = "—";

    $("eff").textContent = "—";

    $("parentheses").textContent = "—";

    $("dp").innerHTML = "";

    state.step = 0;

    stopPlaying();

    applyAnimationStep();
}


// ==================================================
// EVENTS
// ==================================================

$("build")
    .addEventListener(
        "click",
        buildDimensions
    );


$("matrixCount")
    .addEventListener(
        "change",
        buildDimensions
    );


$("optimize")
    .addEventListener(
        "click",
        optimize
    );


$("next")
    .addEventListener(
        "click",
        nextStep
    );


$("prev")
    .addEventListener(
        "click",
        previousStep
    );


$("reset")
    .addEventListener(
        "click",
        reset
    );


$("play")
    .addEventListener(
        "click",
        togglePlay
    );


// ==================================================
// INITIAL LOAD
// ==================================================

buildDimensions();