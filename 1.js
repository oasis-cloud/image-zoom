window.onload = function() {

    var $spin = document.querySelector('.spin')
    var $wrap = document.querySelector('.wrap')
    var $binImg = document.querySelector('.big-wrap img')
    function handleMouseMove(e) {
        
        this.style.cursor = 'move';
        
        var offsetLeft = this.offsetLeft
        var offsetTop = this.offsetTop

        // 计算出正确的坐标位置 0,0 . 基于 $wrap 的坐标系
        var clientX = e.clientX - offsetLeft
        var clientY = e.clientY - offsetTop

        // 边界校验
        var dampingClientX = clientX - $spin.clientWidth/2
        var dampingClientY = clientY - $spin.clientHeight/2

        var moveLeft = clientX - $spin.clientWidth/2;
        var moveTop = clientY - $spin.clientHeight/2;

        console.log("dampingClientX: %s, dampingClientY: %s ", dampingClientX, dampingClientY)

        // spin 不能超越 父元素的边界
        if(dampingClientX <= 0) moveLeft = 0
        if(dampingClientX >= $wrap.clientWidth - $spin.clientWidth) moveLeft = $wrap.clientWidth - $spin.clientWidth

        if(dampingClientY <= 0) moveTop = 0
        if(dampingClientY >= $wrap.clientHeight - $spin.clientHeight) moveTop = $wrap.clientHeight - $spin.clientHeight

        // 移动 spin
        $spin.style.left = moveLeft + "px"
        $spin.style.top = moveTop + "px"

        // 移动图片
        var bigImgWidth = $binImg.clientWidth
        var bigImgHeight = $binImg.clientHeight
        // 计算比例
        var rateX = moveLeft / $wrap.clientWidth
        var rateY = moveTop / $wrap.clientHeight

        var spinRateX = moveLeft / $spin.clientWidth
        var spinRateY = moveTop / $spin.clientHeight

        $spin.style.backgroundImage = "url(https://img12.360buyimg.com/n0/jfs/t1/752/16/3914/75219/5b99cbf9Eaf5e4069/fe59a5713cb36eb2.jpg) "
        $spin.style.backgroundPosition = -rateX * bigImgWidth + 'px ' + -rateY * bigImgHeight + 'px '

        // 根据比例移动图片
        $binImg.style.left = -rateX * bigImgWidth + 'px'
        $binImg.style.top = -rateY * bigImgHeight + 'px'
    }

    // $wrap.addEventListener('mousemove', handleMouseMove, false)

    $wrap.onmousemove = handleMouseMove
}