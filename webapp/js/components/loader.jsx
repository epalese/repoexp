import React from 'react'
import ClassNames from 'classnames'

export default React.createClass({
    render: function() {
        var classes = ClassNames({
            'loader-container': true,
            'inline': this.props.inline
        });
        return (
            <div className="loader">
                <div className={classes}>
                    <aside></aside>
                    <aside></aside>
                    <aside></aside>
                    <aside></aside>
                    <aside></aside>
                </div>
            </div>
        );
    }
})