/**
 * Invoked when a search has been made to the fake 'database' created above.
 */
function searchForUser(){
    let searched =  document.getElementById("SearchedTerm").value.toLowerCase();
    let container = document.getElementById("users");
    let items = container.getElementsByTagName("li");
    for (let i =0;i<items.length;i++) {
        let link = items[i].getElementsByTagName("a")[0];
        let content = link.innerText;
        items[i].style.display = content.toLowerCase().includes(searched) ? "":"none";
    }
}
