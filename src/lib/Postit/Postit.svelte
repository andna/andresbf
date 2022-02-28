<script>
    export let postData
    let currentPostType = postData.postType || 0
    let currentColor = postData.colour || 0

    let sizes = [
        { id: 'big', svg: 360 },
        { id: 'medium', svg: 250 },
        { id: 'small', svg: 200 },
    ]

    let svgSize = sizes[postData.size] ? sizes[postData.size].svg : 360

    import { svgColorsDB } from './svg-colors-db.js';

    let svgColors = svgColorsDB


    function returnColor(type, postColor, detail,pos){
        let color = svgColors[type][postColor][detail][pos]
        return `rgb( ${color.r}, ${color.g}, ${color.b})`
    }

    let currentDetailColors = []
    if(svgColors[currentPostType]){
        svgColors[currentPostType][currentColor].forEach((detail, i) => {
            currentDetailColors.push([])
            detail.forEach((gradientColor, j) => {
                currentDetailColors[i].push(returnColor(currentPostType, currentColor, i, j))
            })
        })
    }


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

    let containerSize = `height: ${svgSize}px; width: ${svgSize}px;`



    let fontSizes = [

    ];

</script>
<div class="container-postit  postit-{postData.id} container-postit-{currentPostType}"  on:click={startFadeColor} style={containerSize}>
    <div class="container-postit-content postit-size-{sizes[postData.size] ? sizes[postData.size].id : 'big'}">
        {#if postData.text}
            <div class="postit-text">
                {@html postData.text}
            </div>
        {/if}
        {#if postData.subtext}
            <div class="postit-subtext">
                {@html postData.subtext}
            </div>
        {/if}
    </div>

    {#if currentPostType === 4}
        <iframe title={postData.id} class="video-iframe" width={svgSize - 92} height={svgSize - 92} src="//www.youtube.com/embed/1onw8rSfDsg?showinfo=0&loop=1&rel=0&controls=1&modestbranding=1" frameborder="0" allowfullscreen></iframe>
    {/if}

    <div class="container-postit-svg">

        <svg width={svgSize} height={svgSize} viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg">
            {#if currentPostType === 0}
                <g clip-path="url(#clip0_{postData.id})">
                    <mask id="mask0_{postData.id}" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="354" height="359">
                        <path d="M353 0H0V358.469C81.329 358.469 152.772 361.77 242.5 341C296.5 328.5 347.083 307.5 353 266.046C355.111 251.255 353 201.929 353 0Z" fill="url(#paint0_linear_{postData.id})"/>
                    </mask>
                    <g mask="url(#mask0_{postData.id})">
                        <rect width="382.131" height="376.23" fill="url(#paint1_linear_{postData.id})"/>
                        <path d="M295.5 261C249 332 187.5 350 140.5 360C242.754 370.113 357.787 323.587 357.787 274.426C318.689 301.721 295.5 261 295.5 261Z" fill="url(#paint2_linear_{postData.id})"/>
                    </g>
                </g>
                <defs>
                    <linearGradient id="paint0_linear_{postData.id}" x1="173.389" y1="1.01548e-07" x2="173.389" y2="363.555" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#96E6B1"/>
                        <stop offset="1" stop-color="#63DD94"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear_{postData.id}" x1="191.066" y1="0" x2="191.066" y2="376.23" gradientUnits="userSpaceOnUse">
                        <stop offset="0.0001" stop-color={currentDetailColors[0][0]}/>
                        <stop offset="1" stop-color={currentDetailColors[0][1]}/>
                    </linearGradient>
                    <linearGradient id="paint2_linear_{postData.id}" x1="298.778" y1="261" x2="223.786" y2="363.426" gradientUnits="userSpaceOnUse">
                        <stop stop-color={currentDetailColors[1][0]}/>
                        <stop offset="1" stop-color={currentDetailColors[1][1]}/>
                    </linearGradient>

                    <clipPath id="clip0_{postData.id}">
                        <rect width="360" height="360" fill="white"/>
                    </clipPath>
                </defs>
            {:else if currentPostType === 1}

                <g clip-path="url(#clip0_{postData.id})">
                    <mask id="mask0_{postData.id}" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="358" height="360">
                        <path d="M358 0.215286L1.49998 0.21529C1.49998 0.21529 -4.67198 314.047 10.8466 340.157C26.3652 366.267 358 359.1 358 359.1L358 0.215286Z" fill="url(#paint0_linear_{postData.id})"/>
                    </mask>
                    <g mask="url(#mask0_{postData.id})">
                        <rect width="382.131" height="376.23" fill="url(#paint1_linear_{postData.id})"/>
                    </g>
                </g>
                <defs>
                    <linearGradient id="paint0_linear_{postData.id}" x1="180.397" y1="0.215289" x2="180.397" y2="372.467" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#96E6B1"/>
                        <stop offset="1" stop-color="#63DD94"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear_{postData.id}" x1="191.066" y1="4.39011e-06" x2="42" y2="311" gradientUnits="userSpaceOnUse">
                        <stop stop-color={currentDetailColors[0][0]}/>
                        <stop offset="0.417419" stop-color={currentDetailColors[0][1]}/>
                        <stop offset="0.826042" stop-color={currentDetailColors[0][2]}/>
                        <stop offset="0.867708" stop-color={currentDetailColors[0][3]}/>
                    </linearGradient>
                    <clipPath id="clip0_{postData.id}">
                        <rect width="360" height="360" fill="white"/>
                    </clipPath>
                </defs>
            {:else if currentPostType === 2}
                <mask id="mask0_{postData.id}" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="5" y="0" width="350" height="352">
                    <path d="M351.875 0H5.13902C5.13902 0 9.63916 306.764 5.13902 329.682C0.638887 352.6 106.139 352.764 212.639 349.764C290.838 347.561 354.139 329.264 354.139 329.264C354.139 329.264 340.639 295.764 351.875 0Z" fill="url(#paint0_linear_{postData.id})"/>
                </mask>
                <g mask="url(#mask0_{postData.id})">
                    <rect x="3.13916" y="-5.23621" width="382.131" height="376.23" fill="url(#paint1_linear_{postData.id})"/>
                </g>
                <defs>
                    <linearGradient id="paint0_linear_{postData.id}" x1="187.138" y1="-5.23622" x2="187.138" y2="358.682" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#96E6B1"/>
                        <stop offset="1" stop-color="#63DD94"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear_{postData.id}" x1="194.139" y1="22.7638" x2="194.139" y2="363.764" gradientUnits="userSpaceOnUse">
                        <stop stop-color={currentDetailColors[0][0]}/>
                        <stop offset="0.190625" stop-color={currentDetailColors[0][1]}/>
                        <stop offset="0.64375" stop-color={currentDetailColors[0][2]}/>
                        <stop offset="1" stop-color={currentDetailColors[0][3]}/>
                    </linearGradient>
                </defs>
            {:else  if currentPostType === 3}
                <g clip-path="url(#clip0_{postData.id})">
                    <mask id="mask0_{postData.id}" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="-5" y="0" width="365" height="358">
                        <path d="M360 0L4.14704 3.00407e-05C4.14704 3.00407e-05 -10.7391 358 -1.86802 358C7.00302 358 89.4506 353 200.598 350C282.21 347.797 360 350 360 350L360 0Z" fill="url(#paint0_linear_{postData.id})"/>
                    </mask>
                    <g mask="url(#mask0_{postData.id})">
                        <rect x="-1.02148" y="-10.9999" width="382.131" height="376.23" fill="url(#paint1_linear_{postData.id})"/>
                    </g>
                </g>
                <defs>
                    <linearGradient id="paint0_linear_{postData.id}" x1="194.09" y1="-11" x2="194.09" y2="352.918" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#96E6B1"/>
                        <stop offset="1" stop-color="#63DD94"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear_{postData.id}" x1="215.479" y1="314.5" x2="217.979" y2="15.5001" gradientUnits="userSpaceOnUse">
                        <stop stop-color={currentDetailColors[0][0]}/>
                        <stop offset="0.720371" stop-color={currentDetailColors[0][1]}/>
                        <stop offset="0.889863" stop-color={currentDetailColors[0][2]}/>
                    </linearGradient>
                    <clipPath id="clip0_{postData.id}">
                        <rect width="360" height="360" fill="white"/>
                    </clipPath>
                </defs>
            {:else}
                <rect width="300" height="340.244" fill="white"/>
                <rect x="18.293" y="14.6338" width="267.073" height="267.073" fill="url(#paint0_linear_216_2404)"/>
                <defs>
                    <linearGradient id="paint0_linear_216_2404" x1="151.83" y1="14.6338" x2="151.83" y2="281.707" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#736F6B"/>
                        <stop offset="1" stop-color="#5F5243"/>
                    </linearGradient>
                </defs>
            {/if}

        </svg>

    </div>
</div>

<style>
    .container-postit{
        position: relative;
    }
    .container-postit-svg{
        position: absolute;
        left: 0;
        top: 0;
        z-index: -1;
    }
    .video-iframe{
        position: absolute;
        left: 18px;
        top: 14px;
    }
    .container-postit-content{
        white-space: break-spaces;
        word-break: break-all;
        cursor: pointer;
        padding: 1em;
    }

    .container-postit-content.is-link:hover{
        filter:brightness(110%);
        text-decoration: underline;
    }
    .postit-text{
        font-weight: 800;
    }
    .container-postit-4 .container-postit-content{
        position: absolute;
        bottom: 34px;
        left: 0;
    }

    .postit-size-big{
        line-height: 116%;
        font-size: 2em;
    }

    .postit-size-big .postit-subtext{
        font-size: 0.7em;
        line-height: 142%;

    }

    .postit-size-medium{
        font-size: 1.2em;
        line-height: 116%;

    }
    .postit-size-small{
        line-height: 116%;
        font-size: 1em;

    }

    .postit-mail,
    .postit-linkedin,
    .postit-instagram,
    .postit-youtube,
    .postit-behance,
    .postit-last{
        text-align: center;
    }

</style>



