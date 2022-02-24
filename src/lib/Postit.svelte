


<script>
    export let currentPostType = 0;
    export let currentColor = 0;
    export let svgSize = 360;
    export let postId

    let svgColors = [
        [// post0
            [//red
                [{r: 241, g: 212, b: 225}, {r: 236, g: 164, b: 196} ],
                [{r: 232, g: 164, b: 194},  {r: 210, g: 134, b: 168} ]
            ],
            [//green
                [{r: 217, g: 243, b: 226}, {r: 120, g: 223, b: 186}],
                [{r: 118, g: 222, b: 197},  {r: 119, g: 168, b: 148}],
            ],
            [//blue
                [{r: 200, g: 224, b: 243}, {r: 137, g: 194, b: 242}],
                [{r: 144, g: 182, b: 214},  {r: 109, g: 137, b: 160}],
            ],
            [//yellow
                [{r: 255, g: 249, b: 193}, {r: 231, g: 222, b: 135} ],
                [{r: 214, g: 207, b: 136},  {r: 192, g: 172, b: 100} ]
            ]
        ],
        [// post1
            [//red
                [{r: 242, g: 212, b: 225}, {r: 242, g: 221, b: 224}, {r: 238, g: 172, b: 201}, {r: 215, g: 141, b: 174}],
            ],
            [//green
                [{r: 186, g: 244, b: 220}, {r: 189, g: 238, b: 215}, {r: 146, g: 229, b: 197}, {r: 117, g: 206, b: 179}],
            ],
            [//blue
                [{r: 198, g: 223, b: 244}, {r: 159, g: 205, b: 243}, {r: 148, g: 199, b: 243}, {r: 124, g: 156, b: 183}],
            ],
            [//yellow
                [{r: 255, g: 249, b: 191}, {r: 250, g: 244, b: 180}, {r: 231, g: 223, b: 154}, {r: 214, g: 199, b: 120}],
            ]
        ],
        [// post2
            [//red
                [{r: 242, g: 216, b: 228}, {r: 246, g: 194, b: 217}, {r: 234, g: 161, b: 193}, {r: 244, g: 186, b: 211}],
            ],
            [//green
                [{r: 217, g: 243, b: 226}, {r: 157, g: 225, b: 195}, {r: 144, g: 228, b: 196}, {r: 162, g: 244, b: 215}],
            ],
            [//blue
                [{r: 199, g: 224, b: 245}, {r: 153, g: 202, b: 244}, {r: 138, g: 180, b: 216}, {r: 152, g: 200, b: 241}],
            ],
            [//yellow
                [{r: 255, g: 250, b: 192}, {r: 235, g: 228, b: 159}, {r: 218, g: 205, b: 128}, {r: 230, g: 221, b: 150}],
            ]
        ],
        [// post3
            [//red
                [{r: 244, g: 226, b: 234}, {r: 243, g: 184, b: 210}, {r: 232, g: 159, b: 191}],
            ],
            [//green
                [{r: 186, g: 244, b: 220}, {r: 146, g: 229, b: 197}, {r: 117, g: 206, b: 179}],
            ],
            [//blue
                [{r: 200, g: 225, b: 246}, {r: 153, g: 202, b: 244}, {r: 144, g: 182, b: 214}],
            ],
            [//yellow
                [{r: 251, g: 245, b: 182}, {r: 226, g: 220, b: 151}, {r: 221, g: 208, b: 132}],
            ]
        ]
    ]


    function returnColor(type, postColor, detail,pos){
        let color = svgColors[type][postColor][detail][pos]
        return `rgb( ${color.r}, ${color.g}, ${color.b})`
    }

    let currentDetailColors = []
    console.log(currentColor)
    svgColors[currentPostType][currentColor].forEach((detail, i) => {
        currentDetailColors.push([])
        detail.forEach((gradientColor, j) => {
            currentDetailColors[i].push(returnColor(currentPostType, currentColor, i, j))
        })
    })


    let animationLength = 500;
    let isFading = false;



    function startFadeColor() {
        if(!isFading){
            isFading = true;
            currentDetailColors.forEach((detail, detailIndex) => {

                detail.forEach((color, index) => {
                    let start = svgColors[currentPostType][currentColor][detailIndex][index]
                    let end = svgColors[currentPostType][getNextColor()][detailIndex][index]
                    fadeColor(start, end, detailIndex, index)
                })
            });
            setTimeout(function(){
                isFading = false;
                currentColor = getNextColor();
                console.log(currentPostType, currentDetailColors);
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
<svg on:click={startFadeColor} width={svgSize} height={svgSize} viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg">
{#if currentPostType === 0}
    <g clip-path="url(#clip0_{postId})">
        <mask id="mask0_{postId}" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="354" height="359">
            <path d="M353 0H0V358.469C81.329 358.469 152.772 361.77 242.5 341C296.5 328.5 347.083 307.5 353 266.046C355.111 251.255 353 201.929 353 0Z" fill="url(#paint0_linear_{postId})"/>
        </mask>
        <g mask="url(#mask0_{postId})">
            <rect width="382.131" height="376.23" fill="url(#paint1_linear_{postId})"/>
            <path d="M295.5 261C249 332 187.5 350 140.5 360C242.754 370.113 357.787 323.587 357.787 274.426C318.689 301.721 295.5 261 295.5 261Z" fill="url(#paint2_linear_{postId})"/>
        </g>
    </g>
    <defs>
        <linearGradient id="paint0_linear_{postId}" x1="173.389" y1="1.01548e-07" x2="173.389" y2="363.555" gradientUnits="userSpaceOnUse">
            <stop stop-color="#96E6B1"/>
            <stop offset="1" stop-color="#63DD94"/>
        </linearGradient>
        <linearGradient id="paint1_linear_{postId}" x1="191.066" y1="0" x2="191.066" y2="376.23" gradientUnits="userSpaceOnUse">
            <stop offset="0.0001" stop-color={currentDetailColors[0][0]}/>
            <stop offset="1" stop-color={currentDetailColors[0][1]}/>
        </linearGradient>
        <linearGradient id="paint2_linear_{postId}" x1="298.778" y1="261" x2="223.786" y2="363.426" gradientUnits="userSpaceOnUse">
            <stop stop-color={currentDetailColors[1][0]}/>
            <stop offset="1" stop-color={currentDetailColors[1][1]}/>
        </linearGradient>

        <clipPath id="clip0_{postId}">
            <rect width="360" height="360" fill="white"/>
        </clipPath>
    </defs>
{:else if currentPostType === 1}
    <mask id="mask0_225_1843" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="5" y="0" width="350" height="352">
        <path d="M351.875 0H5.13902C5.13902 0 9.63916 306.764 5.13902 329.682C0.638887 352.6 106.139 352.764 212.639 349.764C290.838 347.561 354.139 329.264 354.139 329.264C354.139 329.264 340.639 295.764 351.875 0Z" fill="url(#paint0_linear_225_1843)"/>
    </mask>
    <g mask="url(#mask0_225_1843)">
        <rect x="3.13916" y="-5.23621" width="382.131" height="376.23" fill="url(#paint1_linear_225_1843)"/>
    </g>
    <defs>
        <linearGradient id="paint0_linear_225_1843" x1="187.138" y1="-5.23622" x2="187.138" y2="358.682" gradientUnits="userSpaceOnUse">
            <stop stop-color="#96E6B1"/>
            <stop offset="1" stop-color="#63DD94"/>
        </linearGradient>
        <linearGradient id="paint1_linear_225_1843" x1="194.139" y1="22.7638" x2="194.139" y2="363.764" gradientUnits="userSpaceOnUse">
            <stop stop-color={currentDetailColors[0][0]}/>
            <stop offset="0.190625" stop-color={currentDetailColors[0][1]}/>
            <stop offset="0.64375" stop-color={currentDetailColors[0][2]}/>
            <stop offset="1" stop-color={currentDetailColors[0][3]}/>
        </linearGradient>
    </defs>
{:else if currentPostType === 2}
    <g clip-path="url(#clip0_225_1933)">
        <mask id="mask0_225_1933" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="358" height="360">
            <path d="M358 0.215286L1.49998 0.21529C1.49998 0.21529 -4.67198 314.047 10.8466 340.157C26.3652 366.267 358 359.1 358 359.1L358 0.215286Z" fill="url(#paint0_linear_225_1933)"/>
        </mask>
        <g mask="url(#mask0_225_1933)">
            <rect width="382.131" height="376.23" fill="url(#paint1_linear_225_1933)"/>
        </g>
    </g>
    <defs>
        <linearGradient id="paint0_linear_225_1933" x1="180.397" y1="0.215289" x2="180.397" y2="372.467" gradientUnits="userSpaceOnUse">
            <stop stop-color="#96E6B1"/>
            <stop offset="1" stop-color="#63DD94"/>
        </linearGradient>
        <linearGradient id="paint1_linear_225_1933" x1="191.066" y1="4.39011e-06" x2="42" y2="311" gradientUnits="userSpaceOnUse">
            <stop stop-color={currentDetailColors[0][0]}/>
            <stop offset="0.417419" stop-color={currentDetailColors[0][1]}/>
            <stop offset="0.826042" stop-color={currentDetailColors[0][2]}/>
            <stop offset="0.867708" stop-color={currentDetailColors[0][3]}/>
        </linearGradient>
        <clipPath id="clip0_225_1933">
            <rect width="360" height="360" fill="white"/>
        </clipPath>
    </defs>
{:else}
    <g clip-path="url(#clip0_225_1939)">
        <mask id="mask0_225_1939" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="-5" y="0" width="365" height="358">
            <path d="M360 0L4.14704 3.00407e-05C4.14704 3.00407e-05 -10.7391 358 -1.86802 358C7.00302 358 89.4506 353 200.598 350C282.21 347.797 360 350 360 350L360 0Z" fill="url(#paint0_linear_225_1939)"/>
        </mask>
        <g mask="url(#mask0_225_1939)">
            <rect x="-1.02148" y="-10.9999" width="382.131" height="376.23" fill="url(#paint1_linear_225_1939)"/>
        </g>
    </g>
    <defs>
        <linearGradient id="paint0_linear_225_1939" x1="194.09" y1="-11" x2="194.09" y2="352.918" gradientUnits="userSpaceOnUse">
            <stop stop-color="#96E6B1"/>
            <stop offset="1" stop-color="#63DD94"/>
        </linearGradient>
        <linearGradient id="paint1_linear_225_1939" x1="215.479" y1="314.5" x2="217.979" y2="15.5001" gradientUnits="userSpaceOnUse">
            <stop stop-color={currentDetailColors[0][0]}/>
            <stop offset="0.720371" stop-color={currentDetailColors[0][1]}/>
            <stop offset="0.889863" stop-color={currentDetailColors[0][2]}/>
        </linearGradient>
        <clipPath id="clip0_225_1939">
            <rect width="360" height="360" fill="white"/>
        </clipPath>
    </defs>
{/if}

</svg>



