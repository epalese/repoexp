import React    from 'react';
import d3       from 'd3';

let Chart = React.createClass({
    propTypes: {
        height: React.PropTypes.number.isRequired,
        width: React.PropTypes.number.isRequired,
        margin: React.PropTypes.shape({
            top: React.PropTypes.number,
            right: React.PropTypes.number,
            botttom: React.PropTypes.number,
            left: React.PropTypes.number
        }).isRequired
    },
    getDefaultProps: function() {
        return {
            height: 0,
            width: 0,
            margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
        }
    },
    render: function() {
        return (
            <svg ref="svg"
                width={this.props.width} height={this.props.height}
                viewBox={this.props.viewBox}
                preserveAspectRatio={this.props.preserveAspectRatio}>
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    {this.props.children}
                </g>
            </svg> 
        );
    }
});

let Axis = React.createClass({
    componentDidUpdate() {
        this.renderAxis();
    },
    componentDidMount() {
        this.renderAxis();
    },
    renderAxis() {
        var node  = this.refs.axis;
        var axis = d3.svg.axis().orient(this.props.orient).ticks(5).scale(this.props.scale);
        d3.select(node).call(axis)
        .append("text")
        .attr("transform",
            "translate(" + (this.props.x_position)
            + " ," + (this.props.y_position) + ")")
        .style("text-anchor", "middle")
        .text("Date");
    },
    render() {
        return <g className="axis" ref="axis" transform={this.props.translate}></g>
    }
});


let XYAxis =  React.createClass({
    getDefaultProps: function() {
        return {
            data: [],
            x_axis_variable: null,
            y_axis_variable: null,
            width: 0,
            height: 0,
            margin_top: 0,
            margin_right: 0,
            margin_bottom: 0,
            margin_left: 0
        }
    },
    render() {
        var props = this.props;
        var width = props.width - props.margin_left - props.margin_right;
        var height = props.height - props.margin_top - props.margin_bottom;
        var data = props.data.map(function(d) {
            return d[props.y_axis_variable];
        });
        var yScale = d3.scale.linear()
          .domain([0, d3.max(data)])
          .range([0, height]);

        var xScale = d3.scale.ordinal()
          .domain(d3.range(this.props.data.length))
          .rangeRoundBands([0, width], 0.05);
        const xSettings = {
            // translate: 'translate(0,' + (props.height - props.padding) + ')',
            translate: 'translate(' + props.margin_left + ', ' 
                + (parseInt(props.margin_top) + parseInt(height)) + ')',
            scale: xScale,
            orient: 'bottom',
            x_position: props.width / 2,
            y_position: parseInt(props.height) + 2
        };
        const ySettings = {
            // translate: 'translate(5,' + props.padding + ', 0)',
            translate: 'translate(' + props.margin_left + ', ' + props.margin_top + ')',
            scale: yScale,
            orient: 'left',
            x_position: 0,
            y_position: props.height / 2
        };
        return (
            <g className="xy-axis">
                <Axis {...xSettings}/>
                <Axis {...ySettings}/>
            </g>
        );
    }
});


let Rect = React.createClass({
    getDefaultProps: function() {
        return {
            width: 0,
            height: 0,
            x: 0,
            y: 0
        }
    },

    shouldComponentUpdate: function(nextProps) {
      return this.props.height !== nextProps.height;
    },

    render: function() {
        return (
          <rect className="bar"
                height={this.props.height} 
                y={this.props.y} 
                width={this.props.width}
                x={this.props.x}
          >
          </rect>
        );
    },
});

let Bar = React.createClass({
    getDefaultProps: function() {
        return {
          data: [],
          width: 0,
          height: 0,
          x_axis_variable: null,
          y_axis_variable: null,
          margin_top: 0,
          margin_right: 0,
          margin_bottom: 0,
          margin_left: 0
        }
    },

    shouldComponentUpdate: function(nextProps) {
        return this.props.data !== nextProps.data;
    },

    render: function() {
        var props = this.props;
        var width = props.width - props.margin_left - props.margin_right;
        var height = props.height - props.margin_top - props.margin_bottom;
        var data = props.data.map(function(d) {
            return d[props.y_axis_variable];
        });

        var yScale = d3.scale.linear()
            .domain([0, d3.max(data)])
            .range([0, height]);

        var xScale = d3.scale.ordinal()
            .domain(d3.range(this.props.data.length))
            .rangeRoundBands([0, width], 0.05);

        var bars = data.map(function(point, i) {
            var barHeight = yScale(point),
                y = height - barHeight,
                barWidth = xScale.rangeBand(),
                x = xScale(i);

            return (
                <Rect height={barHeight} 
                      width={barWidth} 
                      x={x} 
                      y={y} 
                      key={i} />
            )
        });

        var translate = "translate(" + props.margin_left + "," + props.margin_top + ")";

        return (
            <g className="bar-chart" ref="bar-chart" transform={translate}>{bars}</g>
        );
    }
});

export {Chart, Bar, Rect, Axis, XYAxis};