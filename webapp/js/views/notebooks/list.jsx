"use strict";

import React      from 'react';
import { Link }   from 'react-router';
import NotebookList   from 'appRoot/components/notebooks/list';
 
export default React.createClass({
   render: function () {
        console.log("views.notebooks.list.render");
        return (
            <div>
                <div className="notebook-list-view">
                    <NotebookList />
                </div>
            </div>
        );
    }
});