console.log("hello");

document.getElementById("openFormBtn").addEventListener("click", function() {
    document.getElementById("task-container").style.display = "block";
    console.log("clicked");
})

document.getElementById("closeFormBtn").addEventListener("click", function() {
    document.getElementById("task-container").style.display = "none";
    console.log("clicked");
})