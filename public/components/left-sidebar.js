import {
    html,
    render
} from '/js/lit-html/lit-html.js';
console.log('left-sidebar!');
console.log(html);


// handlers
const itemClickHandler = (e) => {
    e.preventDefault();
    console.log(e.target.id);

    // create folder from api endpoint
    $.ajax('/api/folder', {
        data: JSON.stringify({
            id: e.target.id
        }),
        contentType: 'application/json',
        type: 'DELETE',
        success: (response) => {
            console.log("success: ", response.success);
            // if succesfuly created
            if(response.success == true) {
                $(document).trigger('update_sidebar');
            }
            
            // if not successfuly alert message
            if(response.success == false) {
                alert(response.message);
            }
        },
        error: (error) => {
            console.log(error);
        }
    });
}

// declare templates
const navbarItem = (name, id) => {
    return (
        html `
            <a href="#" class="nav-link">${name}</a>
            <a href="#" class="nav-link btn btn-outline-danger" @click=${itemClickHandler}  id="${id}"> delete ${name} x </a>
        `
    )
};

$(document).ready(() => {
    console.log('document is ready!');

    // get root
    const sidebarNavRoot = document.getElementById('my-drive-sidebar');
    // if root does not exist do not execute
    if (!sidebarNavRoot) return;


    // update sidebar function
    const updateSidebar = () => {
        // loading
        render(html`Loading...`, sidebarNavRoot);

        // get folders from api /api/folder
        $.getJSON("/api/folder", function (data) {
                const navbarList = [];
                data.forEach(item => {
                    navbarList.push(
                        navbarItem(item.name, item._id)
                    )
                });

                render(navbarList, sidebarNavRoot);
            })
            .fail(function () {
                console.log("error");
            })
    }
    // catch update sidebar event
    $(document).on('update_sidebar', updateSidebar);

    $(document).trigger('update_sidebar');
})