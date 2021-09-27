// Author：MonsterXiao


// 1. 生成扫雷的随机地图的数据

// 生成随机的 0 和 9
const random09 = () => {
    let n = Math.random()
    // n 是 0 - 10 之间的小数
    n = n * 10
    // 取整, n 是 0 - 10 之间的整数
    n = Math.floor(n)
    // n 为 0 到 7 时返回 0，否则返回 9
    // 相当于雷的概率为 20%
    if (n < 8) {
        return 0
    } else {
        return 9
    }
}

// 生成由随机 0 和 9 组成的一维数组
const randomLine09 = (n) => {
    let l = []
    for (let i = 0; i < n; i++) {
        let e = random09()
        l.push(e)
    }
    return l
}

// 生成由随机 0 和 9 组成的二维数组, n 行 n 列
const randomSquare09 = (n) => {
    let l = []
    for (let i = 0; i < n; i++) {
        let e = randomLine09(n)
        l.push(e)
    }
    return l
}

// 复制二维数组的函数
const clonedSquare = (array) => {
    let l = []
    for (let i = 0; i < array.length; i++) {
        let e = array[i]
        let line = e.slice(0)
        l.push(line)
    }
    return l
}

// 判断雷周围格子是否满足边界和非雷（9）条件，满足则 +1 （标记雷）
const plus1 = (array, x, y) => {
    // 周围 8 个格子满足加 1 的条件：
    // array[x][y] 不能是 9（雷）
    // x 和 y 符合边界条件
    let n = array.length
    if (x >= 0 && x < n && y >= 0 && y < n) {
        if (array[x][y] !== 9) {
            array[x][y] += 1
        }
    }
}

// 给雷（9）周围的 8 个格子（0）标记雷的数量
const markAround = (array, x, y) => {
    if (array[x][y] === 9) {
        // 要标记 9 周围的 8 个格子

        // 先标记左边 3 个
        plus1(array, x - 1, y - 1)
        plus1(array, x, y - 1)
        plus1(array, x + 1, y - 1)

        // 标记上下 2 个
        plus1(array, x - 1, y)
        plus1(array, x + 1, y)

        // 标记右边 3 个
        plus1(array, x - 1, y + 1)
        plus1(array, x, y + 1)
        plus1(array, x + 1, y + 1)
    }
}

// 处理0和9的随机二维数组，生成最终的标记好雷的数据
const markedSquare = (array) => {
    let square = clonedSquare(array)
    for (let i = 0; i < square.length; i++) {
        let line = square[i]
        for (let j = 0; j < line.length; j++) {
            markAround(square, i, j)
        }
    }
    return square
}



// 2.根据标记好的的雷数据生成棋盘（最终执行renderBoard()函数）

// 每一行格子的 html 类似如下模板，多行模板组成完整棋盘
// 将雷的数据（二维数组）动态加入到模板中

// <div class="row clearfix">
//     <div class="cell" data-number="9" data-x="0" data-y="0">9</div>
//     <div class="cell" data-number="1" data-x="0" data-y="1">1</div>
//     <div class="cell" data-number="0" data-x="0" data-y="2">0</div>
//     <div class="cell" data-number="0" data-x="0" data-y="3">0</div>
//     <div class="cell" data-number="0" data-x="0" data-y="4">0</div>
//     <div class="cell" data-number="1" data-x="0" data-y="5">1</div>
//     <div class="cell" data-number="1" data-x="0" data-y="6">1</div>
//     <div class="cell" data-number="1" data-x="0" data-y="7">1</div>
//     <div class="cell" data-number="0" data-x="0" data-y="8">0</div>
// </div>

// templateCell 函数, 参数为数组 line 和变量 x, x 表示第几行
const templateCell = (line, x) => {
    let r = ''
    for (let i = 0; i < line.length; i++) {
        let n = line[i]
        r += `<div class="cell" data-number="${n}" data-x="${x}" data-y="${i}">${n}</div>`
    }
    return r
}

// templateRow, 参数 square 二维数组（雷数据），用来生成雷相关的数据模板
const templateRow = (square) => {
    let r = ''
    for (let i = 0; i < square.length; i++) {
        let line = square[i]
        let t = templateCell(line, i)
        r += `<div class="row-clearfix">${t}</div>`
    }
    return r
}

// 用 square 生成 n * n 的格子, 然后插入到页面中
const renderSquare = (square) => {
    let html = templateRow(square)
    let mine = e('#mine')
    appendHtml(mine, html)
}


// 根据游戏模式(默认为'normal')
// 生成雷相关的数据，载入棋盘及关联功能，并保存数据
const renderBoard = (mode = 'easy') => {
    // 检查 mode 的值
    let square = []
    log('本局游戏模式是：', mode)
    if (mode === 'easy') {
        square = randomSquare09(9)
    } else if (mode === 'normal') {
        square = randomSquare09(12)
    } else if (mode === 'hard') {
        square = randomSquare09(16)
    }
    // 生成棋盘数据
    let minesData = markedSquare(square)
    log('本局棋盘数据为：', minesData)
    // 载入棋盘
    renderSquare(minesData)
    // 雷数据保存到 localstorage
    saveMinesData(minesData)
    // 显示雷的初始数量
    updateMinesQty()
    // 开始计时
    handleTimer(1)
}

// 计时器开关
// action 参数值为 1 时，判断是否首次计时，否则重新计时
// action 参数值为 0 时，停止计时
const handleTimer = (action) => {
    let timer = e('#timer')
    let clockId = timer.dataset.value
    let t = 0
    if (action === 1 && clockId === undefined) {
        // 首次计时
        let clockId = setInterval(() => {
            t += 1
            timer.innerText = `${t} 秒`
        }, 1000)
        timer.dataset.value = String(clockId)
    } else if (action === 1 && clockId !== undefined) {
        // 重新计时
        timer.innerText = `0 秒`
        clearInterval(Number(timer.dataset.value))
        let newClockId = setInterval(() => {
            t += 1
            timer.innerText = `${t} 秒`
        }, 1000)
        timer.dataset.value = String(newClockId)
    } else if (action === 0) {
        // 停止计时
        clearInterval(Number(clockId))
    }
}

// 计算雷的数量
const getMinesQty = (square) => {
    let m = 0
    for (let a of square) {
        for (let i = 0; i < a.length; i++) {
            if (a[i] === 9) {
                m += 1
            }
        }
    }
    return m
}

// 更新并显示雷的数量
// 雷的数据从 localstorage 中提取
// n 参数为 0，1 或 -1，用于动态更新雷数变化
// 0 代表雷的初始数量
// 1 是增加一个雷
// -1 是减少一个雷
const updateMinesQty = ( n = 0 ) => {
    // 获取数据，计算剩余雷数
    let data = loadMinesData()
    let minesQty = data.minesQty
    let markedQty = data.marked - n
    let leftQty = minesQty - markedQty

    // 更新 marked 数据并保存到 localstorage
    data.marked = markedQty
    let s = JSON.stringify(data)
    localStorage.minesData = s
    
    // 更新页面雷的数量
    let display = e('#mine-qty')
    display.innerText = `雷：${leftQty}`
}

// 保存棋盘数据到 localstorage
// n 已标记的雷数，默认为 0
const saveMinesData = (minesData) => {
    let qty = getMinesQty (minesData)

    // 用字典来保存数据
    let data = {
        mines: minesData,
        minesQty: qty,
        marked: 0
    }

    let s = JSON.stringify(data)
    localStorage.minesData = s
}

// 从 localstorage 读取棋盘数据
const loadMinesData = () => {
    let s = localStorage.minesData
    if (s === undefined) {
        return []
    } else {
        let data = JSON.parse(s)
        return data
    }
}

// 3. 实现 bindEventDelegate 函数, 只处理格子 .cell 元素
const bindEventDelegate = () => {
    let mine = e('#mine')
    let r = e('#restart')

    // 绑定点击左键事件（展开格子）
    bindEvent(mine, 'click', (event) => {
        let self = event.target
        let isGameOver = r.dataset.lose
        let data = loadMinesData()
        let minesData = data.mines

        if (isGameOver === 'true') {
            // 如果游戏已经结束，退出 callback
            return
        } else if (self.classList.contains('marked')) {
            // 如果格子已经标旗子，则不做处理
            log('已标旗的格子不能点击')
        } else if (self.classList.contains('cell')) {
            // 处理点击格子
            reveal(self, minesData)
            // 处理完格子后，判断是否赢了
            isWin()
        }
    })

    // 绑定点击右键事件（标记旗子）
    bindEvent(mine, 'contextmenu', (event) => {
        // 阻止浏览器右键默认行为
        event.preventDefault()
        let self = event.target
        let isGameOver = r.dataset.lose

        // 如果游戏已经结束，退出 callback
        if (isGameOver === 'true') {
            return
        }

        // 标记或去掉旗子
        self.classList.toggle('marked')

        // 联动更新雷的数量：
        // 若已标旗，剩余雷数 -1
        // 若未标旗，剩余雷数 +1
        if (self.classList.contains('marked')) {
            updateMinesQty(n = -1)
        } else {
            updateMinesQty(n = 1)
        }
    })
}

// reveal 函数处理点击格子
// 如果格子已经显示, 不做任何处理
// 如果没有显示过, 判断下列情况：
// 1. 如果点击的是 9, 展开, 游戏结束
// 2. 如果点击的是 0, 展开并且调用 revealAround 函数
// 3. 如果点击的是其他数字, 展开
const reveal = (cell, square) => {
    if (cell.classList.contains('cell-reveal')) {
        // 已展开的格子，不做处理
        return
    } else if (cell.dataset.number === '9') {
        // 如果点击是 9 (雷)，游戏结束
        gameOver()
    } else if (cell.dataset.number === '0') {
        // 如果是 0，展开本格，隐藏数字
        cell.classList.toggle('cell-reveal')
        cell.classList.toggle('is-zero')
        let x = cell.dataset.x
        let y = cell.dataset.y
        // 并展开周围8个格子
        revealAround(square, x, y)
    } else {
        // 如果不是 9 或 0，只展开本格
        cell.classList.toggle('cell-reveal')
    } 
}

// 判断是否赢了的函数
const isWin = () => {
    // 计算出所有非雷格子数 
    let data = loadMinesData()
    let minesQty = data.minesQty
    let n = data.mines.length
    let cellsQty = n * n
    let a = cellsQty - minesQty

    // 计算出当前已打开的格子数
    let RevealCells = es('.cell-reveal')
    let b = Array.from(RevealCells).length
    
    // 若a和b相等，表示赢了，调用弹窗
    // 若不相等，则不做处理，继续游戏
    if ( a === b) {
        handleAlert()
    } else {
        return
    }
}

// 处理赢了的弹窗
const handleAlert = () => {
    // 停止计时，并获取本局游戏用时
    handleTimer(0)
    let t = document.querySelector('#timer').innerText

    // 调用 sweetalert 库的弹窗，细节看文档
    // promises 异步执行弹窗后的逻辑
    swal({
        title: "你赢啦!",
        text: `用时：${t}，这也太神了吧！`,
        icon: 'images/win.gif',
        button: "再来一局",
    })
    .then((playAgain) => {
        let modes = e('#mode-selector')
        if (playAgain) {
            // 用户点击弹窗按钮，重新开局
            let currentMode = modes.dataset.m
            // 清除并重新载入棋盘
            clearBoard()
            renderBoard(currentMode)

          } else {
            // 用户不点击弹窗按钮，也重新开局
            let currentMode = modes.dataset.m
            // 清除并重新载入棋盘
            clearBoard()
            renderBoard(currentMode)
        }
    })
}

// 处理游戏结束的函数
// 点到雷后，restart 按钮换图，停止计时，然后遍历每一个格子，判断：
// 如果是雷+已标旗+没展开，展开，换x雷图；如果是雷+没标旗+没展开，展开，换红雷图
// 如果不是雷+没展开+有标旗，去掉旗子；其他情况不用处理，游戏结束
const gameOver = () => {
    // restart 按钮换 sadface 图, 设置 data-lose 的值
    updateRestartImg(0)
    // 停止计时
    handleTimer(0)

    // 选择所有格子元素，并进行判断
    let cells = es('.cell')
    for (let i = 0; i < cells.length; i++) {
        let e = cells[i]
        let num = e.dataset.number
        if (num === '9' && e.classList.contains('marked')) {
            e.classList.add('marked-mine')
            e.classList.add('cell-reveal')
        } else if (num === '9' && !e.classList.contains('cell-reveal')) {
            e.classList.add('unmarked-mine')
            e.classList.add('cell-reveal')
        } else if (num !== '9' && e.classList.contains('marked')) {
            e.classList.toggle('marked')
        }
    }
}

// 更新 restart 按钮图片
// n = 1，换 happy face，设置 data-lose 的值为 false
// n = 0， 换 sad face，设置 data-lose 的值为 true
const updateRestartImg = (n) => {
    let restartBtn = e('#restart')
    let restartImg = e('img')
    let src1 = 'images/sadface.png'
    let src2 = 'images/happyface.png'
    if (n === 0) {
        restartBtn.dataset.lose = 'true'
        restartImg.src = src1
    } else {
        restartBtn.dataset.lose = 'false'
        restartImg.src = src2
    }
}


// revealAround 展开 cell 周围 8 个元素,
// x 和 y 是被点击格子的坐标
// 展开周围的元素通过调用 reveal1 函数来解决
const revealAround = function(square, x, y) {
    // 把 string 转化为 number
    x = Number(x)
    y = Number(y)
    
    // 展开左边 3 个格子
    reveal1(square, x - 1, y - 1)
    reveal1(square, x, y - 1)
    reveal1(square, x + 1, y - 1)

    // 展开上下 2 个格子
    reveal1(square, x - 1, y)
    reveal1(square, x + 1, y)

    // 展开右边 3 个格子
    reveal1(square, x - 1, y + 1)
    reveal1(square, x, y + 1)
    reveal1(square, x + 1, y + 1)
}

// reveal1 函数单独处理周围8个元素
// 格子xy坐标要满足边界条件
// 根据坐标拿到对应的格子元素
// 果已经展开过, 那么就不展开元素
// 如果没有展开过, 判断下列情况：
// 如果碰到的是 9, 什么都不做.
// 注意, 这里 9 的处理方式和直接点击格子 9 的处理方式不一样
// 如果碰到的是 0, 递归调用 revealAround 函数
// 如果碰到的是其他元素, 展开
const reveal1 = function(square, x, y) {
    let n = square.length

    //周围格子要满足 x 和 y 的边界条件才能继续处理
    if (x >= 0 && x < n && y >= 0 && y < n) {

        // 根据 x 和 y，用属性选择器找到格子对应的 div 元素
        let sx = String(x)
        let sy = String(y)
        let s = `div[data-x='${sx}'][data-y='${sy}']`
        let div = e(s)
        let num = div.dataset.number

        // 对该坐标格子的情况进行判断并处理
        if (div.classList.contains('cell-reveal') || num === '9' ) {
            // 已展开的格子，不做处理
            // 或
            // 如果是 9(雷)，不做处理
            return
        } else if (num !== '0' && num !== '9') {
            // 如果是非 0 或 9，展开该格子
            div.classList.toggle('cell-reveal')
        } else if (num === '0') {
            // 如果是 0，展开该格子，并隐藏数字
            // 然后递归调用 revealAround 函数，继续展开周围 8 个格子
            div.classList.toggle('cell-reveal')
            div.classList.toggle('is-zero')
            revealAround(square, x, y)
        }
    }
}

// 清除 .active 高亮
const clearActive = () => {
    let active = e('.active')
    if (active !== null) {
        active.classList.remove('active')
    }
}

// 清除棋盘
const clearBoard = () => {
    let mine = e('#mine')
    mine.innerHTML = ''
}

// 转换游戏模式
const switchModes = (modes, self, newMode) => {
    // restart 按钮初始化
    updateRestartImg(1)
    // 更新游戏模式并重新载入游戏
    modes.dataset.m = newMode
    clearActive()
    self.classList.toggle('active')
    clearBoard()
    renderBoard(newMode)
}

// 给 mode-selector 委托 click 事件
const bindEventModeSel = () => {
    let modes = e('#mode-selector')
    bindEvent(modes, 'click', (event) => {
        let self = event.target
        let currentMode = modes.dataset.m
        if (self.innerText === '容易' && currentMode !== 'easy') {
            switchModes (modes, self, 'easy')
        } else if (self.innerText === '困难' && currentMode !== 'hard') {
            switchModes (modes, self, 'hard')
        } else if (self.innerText === '普通' && currentMode !== 'normal') {
            switchModes (modes, self, 'normal')
        }
    })
}

// 给 restart 绑定 click 事件
const bindEventRestart = () => {
    let restartBtn = e('#restart')
    let modes = e('#mode-selector')
    bindEvent(restartBtn, 'click', () => {
        let currentMode = modes.dataset.m
        if (restartBtn.dataset.lose === 'true') {
            // restart 按钮换回 happyface 图
            updateRestartImg(1)
            // 清除并重新载入棋盘
            clearBoard()
            renderBoard(currentMode)
        }
    })
}

const bindEvents = () => {
    bindEventDelegate()
    bindEventRestart()
    bindEventModeSel()
}


const __main = () => {
    log('游戏开始')
    renderBoard()
    bindEvents()  
}

__main()
