


<script>
    export let currentPostType = 0;
    export let currentColor = 0;

    let svgColors = [
        [// post1
            [//green
                [{r: 217, g: 243, b: 226}, {r: 120, g: 223, b: 186}],
                [{r: 118, g: 222, b: 197},  {r: 119, g: 168, b: 148}],
            ],
            [//blue
                [{r: 200, g: 224, b: 243}, {r: 137, g: 194, b: 242}],
                [{r: 144, g: 182, b: 214},  {r: 109, g: 137, b: 160}],
            ],
            [//red
                [{r: 241, g: 212, b: 225}, {r: 236, g: 164, b: 196} ],
                [{r: 232, g: 164, b: 194},  {r: 210, g: 134, b: 168} ]
            ],
            [//yellow
                [{r: 255, g: 249, b: 193}, {r: 231, g: 222, b: 135} ],
                [{r: 214, g: 207, b: 136},  {r: 192, g: 172, b: 100} ]
            ]
        ],
        [// post2
            [//green
                [{r: 217, g: 243, b: 226}, {r: 120, g: 223, b: 186}],
            ],
            [//blue
                [{r: 200, g: 224, b: 243}, {r: 137, g: 194, b: 242}],
            ],
            [//red
                [{r: 241, g: 212, b: 225}, {r: 236, g: 164, b: 196} ],
            ],
            [//yellow
                [{r: 255, g: 249, b: 193}, {r: 231, g: 222, b: 135} ],
            ]
        ],
        [// post3
            [//green
                [{r: 217, g: 243, b: 226}, {r: 120, g: 223, b: 186}],
            ],
            [//blue
                [{r: 200, g: 224, b: 243}, {r: 137, g: 194, b: 242}],
            ],
            [//red
                [{r: 241, g: 212, b: 225}, {r: 236, g: 164, b: 196} ],
            ],
            [//yellow
                [{r: 255, g: 249, b: 193}, {r: 231, g: 222, b: 135} ],
            ]
        ],
        [// post4
            [//green
                [{r: 217, g: 243, b: 226}, {r: 120, g: 223, b: 186}],
            ],
            [//blue
                [{r: 200, g: 224, b: 243}, {r: 137, g: 194, b: 242}],
            ],
            [//red
                [{r: 241, g: 212, b: 225}, {r: 236, g: 164, b: 196} ],
            ],
            [//yellow
                [{r: 255, g: 249, b: 193}, {r: 231, g: 222, b: 135} ],
            ]
        ]
    ]


    function returnColor(type, postColor, detail,pos){
        let color = svgColors[type][postColor][detail][pos]
        return `rgb( ${color.r}, ${color.g}, ${color.b})`
    }


    let currentDetailColors = [
        [ returnColor(currentPostType, currentColor, 0, 0),  returnColor(currentPostType, currentColor, 0, 1)],
    ]
    if (svgColors[currentPostType][currentColor][1]) {
        currentDetailColors.push(
            [  returnColor(currentPostType, currentColor, 1, 0),  returnColor(currentPostType, currentColor, 1, 1)])
    }


    let animationLength = 250;
    let isFading = false;


    function startFadeColor() {
        if(!isFading){
            isFading = true;
            currentDetailColors.forEach((detail, detailIndex) => {
                detail.forEach((color, index) => {
                    let start = svgColors[0][currentColor][detailIndex][index]
                    let end = svgColors[0][getNextColor()][detailIndex][index]
                    fadeColor(start, end, detailIndex, index)
                })
            });
            setTimeout(function(){
                isFading = false;
                currentColor = getNextColor();
            },animationLength);
        }
    }

    function lerp(a,b,u) {
        return ((1-u) * a) + (u * b);
    }
    function fadeColor(start, end, detail, index) {
        var interval = 10;
        var steps =  animationLength/interval;
        var step_u = 1.0/steps;
        var u = 0.0;
        var theInterval = setInterval(function(){
            if (u >= 1.0){ clearInterval(theInterval) }
            var r = Math.round(lerp(start.r, end.r, u));
            var g = Math.round(lerp(start.g, end.g, u));
            var b = Math.round(lerp(start.b, end.b, u));
            currentDetailColors[detail][index] = 'rgb('+r+','+g+','+b+')';
            u += step_u;
        }, interval);
    }

    function getNextColor(){
        return currentColor + 1 >= svgColors[0].length ? 0 : currentColor + 1;
    }

</script>


<svg on:click={startFadeColor} width="360" height="360" viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg">

    <g clip-path="url(#clip0_205_686)">
        <mask id="mask0_205_686" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="354" height="359">
            <path d="M353 0H0V358.469C81.329 358.469 152.772 361.77 242.5 341C296.5 328.5 347.083 307.5 353 266.046C355.111 251.255 353 201.929 353 0Z" fill="url(#paint0_linear_205_686)"/>
        </mask>
        <g mask="url(#mask0_205_686)">
            <rect width="382.131" height="376.23" fill="url(#paint1_linear_205_686)"/>
            <path d="M295.5 261C249 332 187.5 350 140.5 360C242.754 370.113 357.787 323.587 357.787 274.426C318.689 301.721 295.5 261 295.5 261Z" fill="url(#paint2_linear_205_686)"/>
        </g>
    </g>
    <defs>
        <linearGradient id="paint0_linear_205_686" x1="173.389" y1="1.01548e-07" x2="173.389" y2="363.555" gradientUnits="userSpaceOnUse">
            <stop stop-color="#96E6B1"/>
            <stop offset="1" stop-color="#63DD94"/>
        </linearGradient>
        <linearGradient id="paint1_linear_205_686" x1="191.066" y1="0" x2="191.066" y2="376.23" gradientUnits="userSpaceOnUse">
            <stop offset="0.0001" stop-color={currentDetailColors[0][0]}/>
            <stop offset="1" stop-color={currentDetailColors[0][1]}/>
        </linearGradient>
        <linearGradient id="paint2_linear_205_686" x1="298.778" y1="261" x2="223.786" y2="363.426" gradientUnits="userSpaceOnUse">
            <stop stop-color={currentDetailColors[1][0]}/>
            <stop offset="1" stop-color={currentDetailColors[1][1]}/>
        </linearGradient>

        <clipPath id="clip0_205_686">
            <rect width="360" height="360" fill="white"/>
        </clipPath>
    </defs>
</svg>






