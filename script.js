// 보드 칸 정보
const boardSpots = [
    { label: "출발!", color: "#fff" },
    { label: "필리핀\n스쿠버 다이빙", color: "#e0f7fa" },
    { label: "독일\n맥주", color: "#fffde7" },
    { label: "일본\n생선회", color: "#e1bee7" },
    { label: "태국\n코끼리", color: "#fff" },
    { label: "중국\n만리장성", color: "#ffe0b2" },
    { label: "몽골\n말", color: "#fff" },
    { label: "인도\n요가", color: "#f8bbd0" },
    { label: "러시아\n발레 공연", color: "#fff" },
    { label: "한 번 쉬세요", color: "#bdbdbd" },
    { label: "브라질\n삼바 축제", color: "#fff" },
    { label: "이탈리아\n피자", color: "#ffe0b2" },
    { label: "이집트\n사막", color: "#fff" },
    { label: "스페인\n박물관", color: "#e1bee7" },
    { label: "호주\n번지 점프", color: "#fff" },
    { label: "프랑스\n미술관", color: "#fffde7" },
    { label: "미국\n놀이공원", color: "#fff" },
    { label: "영국\n축구 경기", color: "#e0f7fa" }
  ];
  
  const totalSpots = boardSpots.length;
  
  let players = [
    { name: "", pos: 0, color: "red", lap: 0, skip: false },
    { name: "", pos: 0, color: "blue", lap: 0, skip: false }
  ];
  let currentPlayer = 0;
  let gameActive = false;
  
  // DOM
  const startScreen = document.getElementById('start-screen');
  const gameScreen = document.getElementById('game-screen');
  const endScreen = document.getElementById('end-screen');
  const quitScreen = document.getElementById('quit-screen');
  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const quitBtn = document.getElementById('quit-btn');
  const dice = document.getElementById('dice');
  const turnInfo = document.getElementById('turn-info');
  const winnerMsg = document.getElementById('winner-msg');
  const player1Input = document.getElementById('player1');
  const player2Input = document.getElementById('player2');
  const boardCanvas = document.getElementById('board');
  const ctx = boardCanvas.getContext('2d');
  const spotInfoDiv = document.getElementById('spot-info');
  const dice3d = document.getElementById('dice3d');
  
  // 각 눈에 해당하는 3D 회전값
  const dice3dRotations = [
    {x: 0,   y: 0},    // 1 (front)
    {x: 90, y: 0},    // 2 (bottom)
    {x: 0,   y: -90},  // 3 (right)
    {x: 0,   y: 90},   // 4 (left)
    {x: -90,  y: 0},    // 5 (top)
    {x: 0,   y: 180}   // 6 (back)
  ];
  
  // 주사위 눈을 점(dot)으로 표시
  const diceDots = [
    [[40,40]],
    [[22,22],[58,58]],
    [[22,22],[40,40],[58,58]],
    [[22,22],[22,58],[58,22],[58,58]],
    [[22,22],[22,58],[40,40],[58,22],[58,58]],
    [[22,22],[22,40],[22,58],[58,22],[58,40],[58,58]]
  ];
  
  // 3D 주사위 면에 점(dot) 표시
  function setDiceFaceDots() {
    const faces = ['front','back','right','left','top','bottom'];
    const dotsForFace = [
      diceDots[0], // 1
      diceDots[5], // 6
      diceDots[2], // 3
      diceDots[3], // 4
      diceDots[4], // 5
      diceDots[1], // 2
    ];
    // 각 면에 맞는 눈 표시
    document.querySelectorAll('.face').forEach((face, idx) => {
      face.innerHTML = '';
      let dots = [];
      switch(faces[idx]) {
        case 'front':  dots = diceDots[0]; break; // 1
        case 'back':   dots = diceDots[5]; break; // 6
        case 'right':  dots = diceDots[2]; break; // 3
        case 'left':   dots = diceDots[3]; break; // 4
        case 'top':    dots = diceDots[4]; break; // 5
        case 'bottom': dots = diceDots[1]; break; // 2
      }
      dots.forEach(([cx,cy]) => {
        const dot = document.createElement('div');
        dot.style.position = 'absolute';
        dot.style.left = (cx-8)+'px';
        dot.style.top = (cy-8)+'px';
        dot.style.width = '16px';
        dot.style.height = '16px';
        dot.style.background = '#222';
        dot.style.borderRadius = '50%';
        face.appendChild(dot);
      });
    });
  }
  
  // 보드 그리기
  function drawBoard() {
    ctx.clearRect(0, 0, 600, 600);
    const cx = 300, cy = 300, r = 250;
    for (let i = 0; i < totalSpots; i++) {
      const angle = (2 * Math.PI / totalSpots) * i - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
  
      // 칸 배경
      ctx.beginPath();
      ctx.arc(x, y, 50, 0, 2 * Math.PI);
      ctx.fillStyle = boardSpots[i].color;
      ctx.fill();
      ctx.strokeStyle = "#888";
      ctx.stroke();
  
      // 텍스트
      ctx.fillStyle = "#222";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lines = boardSpots[i].label.split('\n');
      for (let j = 0; j < lines.length; j++) {
        ctx.fillText(lines[j], x, y - 10 + j * 18);
      }
    }
  
    // 말 그리기
    for (let p = 0; p < 2; p++) {
      const pos = players[p].pos;
      const angle = (2 * Math.PI / totalSpots) * pos - Math.PI / 2;
      const x = cx + (r - 30) * Math.cos(angle) + (p === 0 ? -10 : 10);
      const y = cy + (r - 30) * Math.sin(angle) + (p === 0 ? -10 : 10);
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, 2 * Math.PI);
      ctx.fillStyle = players[p].color;
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(players[p].name[0] || (p+1), x, y);
    }
  }
  
  let pendingRoll = null; // 전역 변수로 선언
  
  function rollDice3D() {
    if (!gameActive) return;
  
    // 1. 현재 플레이어가 쉬는 턴인지 먼저 체크!
    if (players[currentPlayer].skip) {
      turnInfo.innerText = `${players[currentPlayer].name}님은 한 턴 쉽니다!`;
      players[currentPlayer].skip = false; // 한 번만 쉬고 다시 false로
      currentPlayer = 1 - currentPlayer;   // 다음 플레이어로 턴 넘김
      updateTurnInfo();
      // 다음 플레이어가 바로 주사위 굴릴 수 있도록 이벤트 연결
      setTimeout(() => {
        dice3d.addEventListener('click', rollDice3D);
      }, 500);
      return; // ★★★ 여기서 반드시 함수 종료!
    }
  
    // 2. 쉬는 턴이 아니면 정상적으로 주사위 굴리기
    dice3d.removeEventListener('click', rollDice3D);
  
    // 미리 랜덤 숫자 정하기
    const roll = Math.floor(Math.random() * 6) + 1;
  
    // 그 숫자에 맞는 각도로 회전
    const extraX = 360 * (2 + Math.floor(Math.random()*2));
    const extraY = 360 * (2 + Math.floor(Math.random()*2));
    const rot = dice3dRotations[roll-1];
    dice3d.style.transform = `rotateX(${rot.x+extraX}deg) rotateY(${rot.y+extraY}deg)`;
  
    setTimeout(() => {
      movePlayer(roll);
    }, 1000);
  }
  
  // 말 이동
  function movePlayer(steps) {
    let player = players[currentPlayer];
    let oldPos = player.pos;
    player.pos = (player.pos + steps) % totalSpots;
    if (oldPos + steps >= totalSpots) player.lap += 1;
    drawBoard();
  
    // 도착한 칸 내용 표시
    const spot = boardSpots[player.pos];
    spotInfoDiv.innerText = spot.label.replace(/\n/g, '\n');
    spotInfoDiv.style.display = 'block';
  
    // spot-info 클릭 이벤트
    spotInfoDiv.onclick = () => {
      spotInfoDiv.style.display = 'none';
      spotInfoDiv.onclick = null; // 이벤트 제거
  
      // 1바퀴 돌았는지 체크
      if (player.lap > 0) {
        endGame(player.name);
        return;
      }
  
      // "한 번 쉬세요" 칸
      if (spot.label.includes("쉬세요")) {
        player.skip = true; // 다음 턴을 쉬게 함
        turnInfo.innerText = `${player.name}님은 한 번 쉽습니다!`;
      }
  
      currentPlayer = 1 - currentPlayer;
      updateTurnInfo();
      dice3d.addEventListener('click', rollDice3D);
    };
  }
  
  // 턴 정보 업데이트
  function updateTurnInfo() {
    turnInfo.innerText = `현재 차례: ${players[currentPlayer].name}`;
  }
  
  // 게임 종료
  function endGame(winner) {
    gameActive = false;
    gameScreen.style.display = "none";
    endScreen.style.display = "flex";
    winnerMsg.innerText = `${winner}님이 1바퀴를 돌아 우승했습니다!`;
  }
  
  // 다시하기
  restartBtn.onclick = () => {
    endScreen.style.display = "none";
    startScreen.style.display = "flex";
    player1Input.value = "";
    player2Input.value = "";
  };
  
  // 끝내기
  quitBtn.onclick = () => {
    endScreen.style.display = "none";
    quitScreen.style.display = "flex";
  };
  
  // 게임 시작
  startBtn.onclick = () => {
    const name1 = player1Input.value.trim() || "놀이 참여자1";
    const name2 = player2Input.value.trim() || "놀이 참여자2";
    players = [
      { name: name1, pos: 0, color: "red", lap: 0, skip: false },
      { name: name2, pos: 0, color: "blue", lap: 0, skip: false }
    ];
    currentPlayer = 0;
    gameActive = true;
    startScreen.style.display = "none";
    gameScreen.style.display = "block";
    setDiceFaceDots(); // 주사위 눈 초기화
    dice3d.style.transform = "rotateX(0deg) rotateY(0deg)";
    updateTurnInfo();
    drawBoard();
    dice3d.addEventListener('click', rollDice3D);
  };ㄴ