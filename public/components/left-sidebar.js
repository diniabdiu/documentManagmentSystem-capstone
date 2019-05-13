import {
    html,
    render
} from '/js/lit-html/lit-html.js';


// handlers
const itemClickHandler = (e) => {
    e.preventDefault();
    console.log(e.target.id);

    // create folder from api endpoint
    $.ajax('/api/folder', {
        data: JSON.stringify({
            id: e.target.id,
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
const navbarItemFolder = (name, id) => {
    return (
        html `
        <div class="row">
            <div class="col-md-8 pickFolder" id="${id}">
                <a href="#" class="nav-link btn btn-light ">${name}</a>
                <hr>
            </div>
            <div class="col-md-4">
                <a href="#" class="nav-link btn btn-danger btn-sm" @click=${itemClickHandler}  id="${id}"> Delete</a>
                <hr>
            </div>
        </div>
        `
    )
};

const navbarItemFile = (name, id) => {
    return (
        html `
        <div class="row">
            <div class="col-md-8">
                <a href="#" class="nav-link btn btn-light ">File: ${name}</a>
                <hr>
            </div>
            <div class="col-md-4">
                <a href="#" class="nav-link btn btn-danger btn-sm" @click=${itemClickHandler}  id="${id}"> Delete</a>
                <hr>
            </div>
        </div>
        `
    )
};

$(document).ready(() => {
    console.log('document is ready!');

    // get root
    const sidebarNavRoot = document.getElementById('my-drive-sidebar');
    // if root does not exist do not execute
    if (!sidebarNavRoot) return;

    // $('.pickFolder').click(function(e) {
    //     console.log(e);
    //     var idFolder = e.target.id;
        // console.log(e);
        // idFolder.click();
        // var id = $(this).attr('id');

        // var folderId = e.target.id;
    //     console.log(folderId);
    //   });


    // update sidebar function
    const updateSidebar = () => {
        // loading
        render(html`Loading...`, sidebarNavRoot);

        // get folders from api /api/folder
        $.getJSON("/api/folder", function (data) {
                const navbarList = [];
                data.forEach(item => {
                    navbarList.push(
                        navbarItemFolder(item.name, item._id)
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