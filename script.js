// ---------- Choice Picker Script ----------
    function parseChoices(raw){
      if(!raw) return [];
      return [...new Set(raw.split(/\n|,|\//).map(s => s.trim()).filter(Boolean))];
    }

    // ---------- Elements ----------
    const choicesEl = document.getElementById('choices');
    const pickBtn = document.getElementById('pickRandom');
    const resultEl = document.getElementById('result');
    const clearBtn = document.getElementById('clear');
    const addExample = document.getElementById('addChoice');
    const createWheelBtn = document.getElementById('createWheel');
    const wheelSvg = document.getElementById('wheel');
    const spinBtn = document.getElementById('spinButton');
    const spinCenter = document.getElementById('spinNow');
    const resetWheel = document.getElementById('resetWheel');

    addExample.onclick = () => choicesEl.value = "Pizza\nBiryani\nPasta\nBurger";
    clearBtn.onclick = () => { choicesEl.value = ''; resultEl.textContent = '—'; wheelSvg.innerHTML = ''; wheelSvg.dataset.choices = ''; }

    // ---------- Quick pick ----------
    pickBtn.onclick = () => {
      const arr = parseChoices(choicesEl.value);
      if (arr.length === 0) { resultEl.textContent = 'Add choices first!'; return; }
      resultEl.textContent = arr[Math.floor(Math.random() * arr.length)];
    };

    // ---------- Wheel creation ----------
    function createWheel(choices){
      wheelSvg.innerHTML = '';
      const n = choices.length;
      const cx = 250, cy = 250, r = 210;
      const g = document.createElementNS('http://www.w3.org/2000/svg','g');

      for(let i=0;i<n;i++){
        const a1 = (i/n)*2*Math.PI - Math.PI/2;
        const a2 = ((i+1)/n)*2*Math.PI - Math.PI/2;
        const x1 = cx + r*Math.cos(a1), y1 = cy + r*Math.sin(a1);
        const x2 = cx + r*Math.cos(a2), y2 = cy + r*Math.sin(a2);
        const large = (a2 - a1 > Math.PI) ? 1 : 0;

        const p = document.createElementNS('http://www.w3.org/2000/svg','path');
        p.setAttribute('d', `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`);
        p.setAttribute('fill', `hsl(${(i*360/n)}deg 70% 50%)`);
        p.setAttribute('stroke', 'rgba(0,0,0,0.25)');
        p.setAttribute('stroke-width', '1');
        g.appendChild(p);

        const mid = (a1 + a2) / 2;
        const tx = cx + (r-60) * Math.cos(mid);
        const ty = cy + (r-60) * Math.sin(mid);
        const t = document.createElementNS('http://www.w3.org/2000/svg','text');
        t.setAttribute('x', tx);
        t.setAttribute('y', ty);
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('dominant-baseline', 'middle');
        t.setAttribute('fill', '#fff');
        t.setAttribute('font-size', '14');
        t.setAttribute('style', 'pointer-events:none; font-weight:700;');
        // rotate text so it's more readable
        const deg = (mid * 180 / Math.PI) + 90;
        t.setAttribute('transform', `rotate(${deg} ${tx} ${ty})`);
        t.textContent = choices[i];
        g.appendChild(t);
      }

      wheelSvg.appendChild(g);
      wheelSvg.dataset.choices = JSON.stringify(choices);
      wheelSvg.dataset.count = choices.length;
      wheelSvg.style.transform = 'rotate(0deg)';
    }

    createWheelBtn.onclick = () => {
      const arr = parseChoices(choicesEl.value);
      if (arr.length < 2) { resultEl.textContent = 'Need at least 2 choices!'; return; }
      createWheel(arr);
      resultEl.textContent = 'Wheel created!';
    };

    // ---------- Spin ----------
    function spinWheel(){
      const data = wheelSvg.dataset.choices;
      if (!data) { alert('Create wheel first!'); return; }
      const choices = JSON.parse(data);
      const n = choices.length;
      if (n === 0) { alert('Create wheel first!'); return; }
      const slice = 360 / n;
      const chosen = Math.floor(Math.random() * n);
      const fullSpins = 360 * 4; // several full rotations
      const target = fullSpins + chosen * slice + slice/2; // land in middle of slice

      // animate
      wheelSvg.style.transition = 'transform 5s cubic-bezier(.14,.9,.2,1)';
      wheelSvg.style.transform = `rotate(${-target}deg)`;

      // show result after animation completes (5s)
      setTimeout(() => {
        resultEl.textContent = choices[chosen];
      }, 5000);
    }

    spinBtn.onclick = spinWheel;
    spinCenter.onclick = spinWheel;

    // ---------- Reset ----------
    resetWheel.onclick = () => {
      wheelSvg.innerHTML = '';
      wheelSvg.dataset.choices = '';
      resultEl.textContent = '—';
      wheelSvg.style.transform = 'rotate(0deg)';
    };

    // Prevent selecting the SVG while spinning if needed
    wheelSvg.addEventListener('mousedown', e => e.preventDefault());