let single = {
    red: {r: 255, g: 173, b: 152},
    green: {r: 208, g: 231, b: 159},
    blue: {r: 151, g: 234, b: 224},
    yellow: {r: 231, g: 223, b: 152},
    black: [{r: 10, g: 52, b: 64} ],
}

let detailPost0 = {
    red: [{r: 232, g: 164, b: 194},  {r: 210, g: 134, b: 168} ],
    green: [{r: 118, g: 222, b: 197},  {r: 119, g: 168, b: 148}],
    blue: [{r: 144, g: 182, b: 214},  {r: 109, g: 137, b: 160}],
    yellow: [{r: 214, g: 207, b: 136},  {r: 192, g: 172, b: 100} ],
    black: [{r: 60, g: 100, b: 90},  {r: 10, g: 52, b: 64} ],
}

export let postitThemes = [
    [// post0
        [//red
            [{r: 241, g: 212, b: 225}, {r: 236, g: 164, b: 196} ],
            detailPost0.red,

        ],
        [//green
            [{r: 217, g: 243, b: 226}, {r: 120, g: 223, b: 186}],
            detailPost0.green,
        ],
        [//blue
            [{r: 208, g: 231, b: 243}, {r: 137, g: 194, b: 242}],
            detailPost0.blue,
        ],
        [//yellow
            [{r: 255, g: 249, b: 193}, {r: 231, g: 222, b: 135} ],
            detailPost0.yellow,
        ],
        [//black
            [{r: 10, g: 52, b: 64}, {r: 23, g: 31, b: 25} ],
            detailPost0.black,
        ]
    ],
    [// post1
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
        ],
        [//black
            [{r: 10, g: 52, b: 64}, {r: 10, g: 52, b: 64} ]
        ]
    ],
    [// post2
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
        ],
        [//black
            [{r: 10, g: 52, b: 64}, {r: 10, g: 52, b: 64} ]
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
        ],
        [//black
            [{r: 10, g: 52, b: 64}, {r: 10, g: 52, b: 64} ]
        ]
    ]
]



export let monokai = [
[// post0
        [//red
            [single.red, single.red],
            detailPost0.red,
        ],
        [//green
            [single.green, single.green],
            detailPost0.green,
        ],
        [//blue
            [single.blue, single.blue],
            detailPost0.blue,
        ],
        [//yellow
            [single.yellow, single.yellow],
            detailPost0.yellow,
        ],
        [//black
            [single.black, single.black ],
            detailPost0.black,
        ]
    ],
    [// post1
        [//red
            [single.red, single.red, single.red, single.red,],
        ],
        [//green
            [single.green, single.green, single.green, single.green, ],
        ],
        [//blue
            [single.blue, single.blue, single.blue, single.blue, ],
        ],
        [//yellow
            [single.yellow, single.yellow, single.yellow, single.yellow, ],
        ],
        [//black
            [single.black, single.black,single.black,single.black ]
        ]
    ],
    [// post2
        [//red
            [single.red, single.red, single.red, single.red,],
        ],
        [//green
            [single.green, single.green, single.green, single.green, ],
        ],
        [//blue
            [single.blue, single.blue, single.blue, single.blue, ],
        ],
        [//yellow
            [single.yellow, single.yellow, single.yellow, single.yellow, ],
        ],
        [//black
            [single.black, single.black, single.black, single.black ]
        ]
    ],
    [// post3
        [//red
            [single.red, single.red, single.red, ],
        ],
        [//green
            [single.green, single.green, single.green,  ],
        ],
        [//blue
            [single.blue, single.blue, single.blue, ],
        ],
        [//yellow
            [single.yellow, single.yellow, single.yellow,  ],
        ],
        [//black
            [single.black, single.black, single.black ]
        ]
    ]
]
