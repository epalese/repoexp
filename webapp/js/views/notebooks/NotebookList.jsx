"use strict";

import React      from 'react';
import { Link }   from 'react-router';
import NotebookListComponent   from 'appRoot/components/notebooks/NotebookListComponent';
 
export default React.createClass({
   render: function () {
        return (
            <div>
                <div className="notebook-list-view">
                    <NotebookListComponent />
                </div>
            </div>
        );
    }
});