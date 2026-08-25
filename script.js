const startBtn = document.getElementById("startBtn");
const homeScreen = document.getElementById("homeScreen");
const onlineScreen = document.getElementById("onlineScreen");

startBtn.addEventListener("click", function() {
    homeScreen.classList.remove("active");
    onlineScreen.classList.add("active");
});