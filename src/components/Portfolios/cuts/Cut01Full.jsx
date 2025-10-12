// MarkdownViewer.tsx
import React from "react";
import ExtrasList from "../../ExtrasList";

export default function Cut01Full({ markdown }) {
  const extrasData = [
    {
      icon: "🇨🇴",
      title: "Based in Bogotá, Colombia"
    },
    {
      icon: "🚴‍♂️",
      title: "Bike rider",
      description: "Best inspiration and stress relief."
    },
    {
      icon: "🎸",
      title: "Bass player",
      description: "And I feel that talks about my role as a team member."
    },
    {
      icon: "🎮",
      title: "Gamer",
      description: "Big fan of Nintendo's polish philosophy."
    }
  ];

  return (
    <div className="portfolio portfolio-FUL">
  

  <div className="flex-evenly">
    <div className="port-avatar"></div>

    <h1 className="port-hi">
      <small>Hello! My name is </small>
      <br />
      Andrés
      <br />
      <small>Bastidas Fierro</small>
    </h1>
    <div className="port-links">
      <a href="mailto:andresbf@gmail.com">📧</a>
      <a href="https://www.linkedin.com/in/andresbf/">💼</a>
      <a href="https://github.com/andresbf">😸</a>
    </div>
  </div>

  <hr />

  <h2 className="port-title"> 🎨 Product Head  <span>&</span>  💻 Web Dev </h2>
  <p>
   I'm a software engineer with an obsession to innovate and build enjoyable experiences.
  </p>
  <p>
    Due to it, I see software as a translator of ideas, which I require to be properly planned as a first step.
    </p>
  <p>
    I focus on the user's final experience, therefore, I start by creating communicative designs and descriptions to be used as a reference for the development team.
  </p>
  <p>
While I'm sketching these UX/UIs, I'm already structuring the code architecture that will be needed to implement them.
  </p>
  <p>
    I'm eager to face more complex problems, even dwelling on new experiences for our interactions 
    through digital mediums such as extended realities.
  </p>

  <h3 className="port-title-lined"><span>🔍 Extras about me</span></h3>

  <ExtrasList items={extrasData} />


  <hr />

<h2>📂 Portfolio</h2>

Proffesional:
Monks: Walmart Bed Bath & Beyond
Monks GreatWolf
quiena.com
Halliburton / Átiko7

Passion projects:
lorebites.com
https://woxrlds.vercel.app/
Aisle Scroller
Movie Cube / Smatchups / Pokeitdex

Games:
https://vibes-style.vercel.app/
Reach Infinity
SpaceO2
LavaSurf

<hr />

<h2>🛠 Other Skills</h2>
<div className="port-skills">
  <div className="port-skill">
<h3>👨‍💻 Frontend Development</h3>
<ul>
  <li>React.js ⚛️</li>
  <li>Angular 2+</li>
</ul>
</div>
  <div className="port-skill">

<h3>🎨 UX / UI</h3>
<ul>
  <li>Figma 🎨</li>
  <li>Photoshop 🖼️</li>
</ul>
</div>
  <div className="port-skill">

<h3>🕶️ VR / AR</h3>
<ul>
  <li>Unity</li>
  <li>Blender</li>
</ul>

</div>
  <div className="port-skill">

<h3>📊 Product Management</h3>
<ul>
  <li>Jira</li>
  <li>Confluence</li>
</ul>
</div>
  <div className="port-skill">


<h3>🧑‍💻 Other Tech</h3>
<ul>
  <li>HTML5, TypeScript, Sass</li>
  <li>C#, UnityScript, Blueprints</li>
  <li>Node.js, PHP, SQL</li>
</ul>
</div>
</div>
  <hr />
  

  <h2>💼 Experience</h2>

  <h3>Quiena Inversiones – <em>Qienna Wealth Management</em></h3>

  <p><strong>Lead Product Manager</strong> (Jun 2021 – Present)</p>
  <ul>
    <li>Merged Business, Tech and UX/UI needs.</li>
    <li>Ensured maximum efficiency of product offerings.</li>
    <li>Tools: Jira, Confluence, Bitbucket, Teams, Office</li>
  </ul>

  <p><strong>Head of User Experience</strong> (Nov 2020 – Jun 2021)</p>
  <ul>
    <li>Led designers to showcase new features and products.</li>
    <li>Tools: Figma, FigJam, Maze, Expo</li>
  </ul>

  <p><strong>Sr. Frontend Developer</strong> (Jan 2016 – Nov 2020)</p>
  <ul>
    <li>Built interfaces for an investing platform.</li>
    <li>Led frontend development solutions (Angular, React, React Native).</li>
  </ul>

  <h3>Other Roles</h3>

  <p><strong>Co-founder</strong></p>
  <p>(Details not specified)</p>

  <p><strong>Halliburton – Oil &amp; Energy</strong> </p>
  <p>Content Manager (Jun 2014 – Jan 2015)</p>

  <p><strong>Átiko7 – Brand Solutions</strong></p>
  <p> Wordpress Developer (Sep 2013 – Mar 2014)</p>

  <hr />

  <h2>🎓 Education</h2>
  <ul>
    <li><strong>Universidad Católica del Ecuador</strong><br />
      🎓 Systems &amp; Computer Engineering (Aug 2010 – Dec 2016)
    </li>
    <li><strong>Universidad de Buenos Aires</strong><br />
      🎓 Master in Interactive Design (Mar 2020 – Ongoing Thesis)
    </li>
  </ul>



    </div>
  );
}
