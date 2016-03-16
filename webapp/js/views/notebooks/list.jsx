"use strict";

import React      from 'react';
import UserList   from 'appRoot/views/users/list';
import NotebookList   from 'appRoot/components/notebooks/list';
 
export default React.createClass({
   render: function () {
        return (
            <div className="notebook-list-view">
                <NotebookList />
            </div>
        );
    }
});
 
