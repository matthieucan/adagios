// Generated by CoffeeScript 1.3.3

/*
Generated by coffee-script, any changes should be made to the adagios.coffee file
*/


(function() {

  jQuery(function($) {
    return $("div.btn-group[data-toggle=\"buttons-radio\"]").each(function() {
      var form, group, hidden, name;
      group = $(this);
      form = group.parents("form").eq(0);
      name = group.attr("data-toggle-name");
      hidden = $("input[name=\"" + name + "\"]", form);
      return $("button", group).each(function() {
        var button;
        button = $(this);
        button.live("click", function() {
          return hidden.val($(this).val());
        });
        if (button.val() === hidden.val()) {
          return button.addClass("active");
        }
      });
    });
  });

  $.extend($.fn.dataTableExt.oStdClasses, {
    sSortAsc: "header headerSortDown",
    sSortDesc: "header headerSortUp",
    sSortable: "header"
  });

  (function($) {
    var filter_cache, obIgnoreTables, object_types;
    obIgnoreTables = [$("table#service")[0], $("table#contact")[0], $("table#host")[0], $("table#command")[0], $("table#timeperiod")[0]];
    filter_cache = {};
    object_types = ['service', 'servicegroup', 'host', 'hostgroup', 'contact', 'contactgroup', 'command', 'timeperiod'];
    $.fn.dataTableExt.afnFiltering.push(function(oSettings, aData) {
      var cache_type, object_type;
      if ($.inArray(oSettings.nTable, obIgnoreTables) === -1) {
        return true;
      }
      object_type = oSettings["sTableId"];
      cache_type = filter_cache[object_type];
      if (cache_type === void 0) {
        return true;
      }
      if (aData[0] === "0" && cache_type === "2") {
        return true;
      }
      if (cache_type === "1" && aData[1] === ("" + object_type + "group") && aData[0] !== "0") {
        return true;
      }
      if (cache_type === "0" && aData[1] === object_type && aData[0] !== "0") {
        return true;
      }
      return false;
    });
    $.fn.adagios_version = function() {
      $.get("http://adagios.opensource.is/rest/adagios/txt/version", function(data) {
        $(this).text(data);
        return this;
      }).error(function() {
        $(this).text("Unknown");
        return this;
      });
      return this;
    };
    $.fn.adagios_ob_configure_dataTable = function(aoColumns, fetch) {
      var $this;
      aoColumns.unshift({
        sTitle: "register",
        bVisible: false
      }, {
        sTitle: "object_type",
        bVisible: false
      }, {
        sTitle: "<label rel=\"tooltip\" title=\"Select All\" id=\"selectall\" class=\"checkbox\"><input type=\"checkbox\"></label>",
        sWidth: "32px"
      });
      $this = $(this);
      $this.data("fetch", fetch);
      $this.data("aoColumns", aoColumns);
      return $this;
    };
    $.fn.adagios_ob_render_dataTable = function() {
      var $this;
      $this = $(this);
      $this.dtData = [];
      $this.fetch = $this.data("fetch");
      $this.aoColumns = $this.data("aoColumns");
      $this.jsonqueries = $this.fetch.length;
      return $.each($this.fetch, function(f, v) {
        var json_query_fields, object_type;
        object_type = v["object_type"];
        console.log("Populating " + object_type + " " + ($(this).attr("id")) + "<br/>");
        json_query_fields = ["id", "register"];
        $.each(v["rows"], function(k, field) {
          if ("cName" in field) {
            json_query_fields.push(field["cName"]);
          }
          if ("cAltName" in field) {
            json_query_fields.push(field["cAltName"]);
          }
          if ("cHidden" in field) {
            return json_query_fields.push(field["cHidden"]);
          }
        });
        $.getJSON("../rest/pynag/json/get_objects", {
          object_type: object_type,
          with_fields: json_query_fields.join(",")
        }, function(data) {
          var count;
          count = data.length;
          return $.each(data, function(i, item) {
            var field_array;
            field_array = [item["register"], object_type, "<input id=\"ob_mass_select\" name=\"" + item["id"] + "\" type=\"checkbox\">"];
            return $.each(v["rows"], function(k, field) {
              var cell, field_value;
              cell = "<a href=\"id=" + item["id"] + "\">";
              field_value = "";
              if ("icon" in field) {
                cell += "<i class=\"" + field.icon + "\"></i>";
              }
              if (item[field["cName"]]) {
                field_value = item[field["cName"]];
              } else {
                if (item[field["cAltName"]]) {
                  field_value = item[field["cAltName"]];
                }
              }
              field_value = field_value.replace("\"", "&quot;");
              field_value = field_value.replace(">", "&gt;");
              field_value = field_value.replace("<", "&lt;");
              if ("truncate" in field && field_value.length > (field["truncate"] + 3)) {
                cell += "<abbr rel=\"tooltip\" title=\" " + field_value + "\">" + (field_value.substr(0, field["truncate"])) + " ...</abbr>";
              } else {
                cell += " " + field_value;
              }
              cell += "</a>";
              field_array.push(cell);
              if (field["cName"] === v["rows"][v["rows"].length - 1]["cName"]) {
                $this.dtData.push(field_array);
                return count--;
              }
            });
          });
        }).success(function() {
          $this.jsonqueries = $this.jsonqueries - 1;
          if ($this.jsonqueries === 0) {
            $("[rel=tooltip]").tooltip();
            $this.data("dtData", $this.dtData);
            return $this.adagios_ob_dtPopulate();
          }
        }).error(function(jqXHR) {});
        return this;
      });
    };
    $.fn.adagios_ob_dtPopulate = function() {
      var $this, aoColumns, dt, dtData, object_type, ot, _i, _len;
      $this = $(this);
      object_type = $this.attr('id');
      dtData = $this.data("dtData");
      aoColumns = $this.data("aoColumns");
      $("#" + object_type + " #loading").hide();
      dt = $this.dataTable({
        aoColumns: aoColumns,
        sPaginationType: "bootstrap",
        bScrollCollapse: false,
        bPaginate: true,
        iDisplayLength: 100,
        aaData: dtData,
        sDom: "<'row-fluid'<'span7'<'toolbar_" + object_type + "'>>'<'span5'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
        fnDrawCallback: function() {
          $("[rel=tooltip]").tooltip();
          return $("input").click(function() {
            var checked;
            checked = $("input#ob_mass_select:checked").length;
            $("#bulkselected").html(checked);
            if (checked > 0) {
              return $("#actions #modify").show();
            } else {
              return $("#actions #modify").hide();
            }
          });
        }
      });
      $("table\#" + object_type + " th:first").unbind("click");
      $(".toolbar_" + object_type).html("<div class=\"row-fluid\">\n  <div class=\"span12\"></div>\n</div>");
      if (object_type !== "command" && object_type !== "timeperiod") {
        $(".toolbar_" + object_type + " div.row-fluid div.span12").append("<div id=\"view_filter\" class=\"btn-group pull-left\"></div>");
      }
      $(".toolbar_" + object_type + " div.row-fluid div.span12").append("<div class=\"pull-left\" id=\"actions\">\n  <div id=\"add\" class=\"btn-group pull-left\">\n    <a href=\"../../objectbrowser/add/" + object_type + "\" class=\"btn capitalize\">\n      Add " + object_type + "\n    </a>\n    <a href=\"#\" class=\"btn dropdown-toggle\" data-toggle=\"dropdown\">\n      <i class=\"caret\"></i>\n    </a>\n    <ul class=\"dropdown-menu nav\">\n      <li class=\"nav-header\">Add</li>\n    </ul>\n  </div>\n  <div id=\"modify\" class=\"btn-group pull-right hide\">\n    <a rel=\"tooltip\" id=\"copy\" title=\"Copy\" class=\"btn btn-important\" data-target-bulk=\"bulk_copy\" data-target=\"copy\"><i class=\"icon-copy\"></i></a>\n    <a rel=\"tooltip\" id=\"update\" title=\"Edit\" class=\"btn\" data-target-bulk=\"bulk_edit\" data-target=\"edit_object\"><i class=\"glyph-pencil\"></i></a>\n    <a rel=\"tooltip\" id=\"delete\" title=\"Delete\" class=\"btn\" data-target-bulk=\"bulk_delete\" data-target=\"delete_object\"><i class=\"glyph-bin\"></i></a>\n  </div>\n</div>\n");
      $("#actions #modify a").on("click", function(e) {
        var $form, checked, id, params, swhat, where;
        checked = $("input#ob_mass_select:checked").length;
        if (checked > 1) {
          params = {};
          swhat = $(this).attr('data-target-bulk');
          $form = $("form[name=\"bulk\"]");
          $form.attr("action", swhat);
          $("table tbody input:checked").each(function(index) {
            return $("<input>").attr({
              type: "hidden",
              name: "change_" + $(this).attr("name"),
              value: "1"
            }).appendTo($form);
          });
          $form.submit();
        } else {
          where = $(this).attr('data-target');
          id = $("table tbody input:checked").attr('name');
          window.location.href = window.location.href.split("#")[0] + ("" + where + "/id=" + id);
        }
        return e.preventDefault();
      });
      if (object_type !== "command" && object_type !== "timeperiod") {
        $(".toolbar_" + object_type + " div.row-fluid ul.dropdown-menu").append("<li><a href=\"../../objectbrowser/add/" + object_type + "group\" class=\"capitalize\">" + object_type + "group</a></li>\n<li class=\"divider\"></li>");
        $(".toolbar_" + object_type + " div#view_filter.btn-group").append("<a rel=\"tooltip\" title=\"Show " + object_type + "s\" class=\"btn active\" data-filter-type=\"0\">\n  <i class=\"glyph-computer-service\"></i>\n</a>\n<a rel=\"tooltip\" title=\"Show " + object_type + "groups\" class=\"btn\" data-filter-type=\"1\">\n  <i class=\"glyph-parents\"></i>\n</a>\n<a rel=\"tooltip\" title=\"Show " + object_type + " templates\" class=\"btn\" data-filter-type=\"2\">\n  <i class=\"glyph-cogwheels\"></i>\n</a>");
        filter_cache[object_type] = "0";
      }
      for (_i = 0, _len = object_types.length; _i < _len; _i++) {
        ot = object_types[_i];
        if (ot === object_type || ot === ("" + object_type + "group")) {
          continue;
        }
        $(".toolbar_" + object_type + " div.row-fluid ul.dropdown-menu").append("<li class=\"capitalize\"><a href=\"../../objectbrowser/add/" + ot + "\">" + ot + "</a></li>");
      }
      console.log("Assignin click on #" + object_type + ".tab-pane label#selectall");
      $("#" + $this.attr("id") + ".tab-pane label#selectall").on("click", function() {
        var $checkbox, checked;
        $checkbox = $("#" + $this.attr("id") + ".tab-pane #selectall input");
        console.log("#" + $this.attr("id") + ".tab-pane #selectall input");
        if ($checkbox.attr("checked") !== undefined) {
          $(".tab-pane.active .dataTable input").each(function() {
            return $(this).attr("checked", "checked");
          });
        } else {
          $(".tab-pane.active .dataTable input").each(function() {
            return $(this).removeAttr("checked");
          });
        }
        checked = $("input#ob_mass_select:checked").length;
        $("#bulkselected").html(checked);
        if (checked > 0) {
          return $("#actions #modify").show();
        } else {
          return $("#actions #modify").hide();
        }
      });
      $("[class^=\"toolbar_\"] div#view_filter.btn-group a").on("click", function(e) {
        var $target;
        $target = $(this);
        e.preventDefault();
        if ($target.hasClass("active")) {
          return false;
        }
        object_type = $target.parentsUntil(".tab-content", ".tab-pane").attr("id");
        $target.siblings().each(function() {
          return $(this).removeClass("active");
        });
        $target.addClass("active");
        filter_cache[object_type] = $target.attr('data-filter-type');
        $("table#" + object_type).dataTable().fnDraw();
        return false;
      });
      $("div\#" + object_type + "_filter.dataTables_filter input").addClass("input-medium search-query");
      return dt.fnSort([[3, "asc"], [4, "asc"]]);
    };
    return $.fn.adagios_ob_run_check_command = function() {
      var bar, id, modal, object_type, plugin_execution_time, step, steps, updateTimer;
      modal = $(this);
      id = modal.attr("data-object-id");
      object_type = modal.attr("data-object-type");
      if (!id) {
        alert("Error, no data-object-id for run command");
        return false;
      }
      $("#run_check_plugin #state").removeClass("label-important");
      $("#run_check_plugin #state").removeClass("label-warning");
      $("#run_check_plugin #state").removeClass("label-success");
      $("#run_check_plugin #state").html("Pending");
      $("#run_check_plugin #output pre").html("Executing check plugin");
      plugin_execution_time = $("#run_check_plugin div.progress").attr("data-timer");
      if (plugin_execution_time > 1) {
        updateTimer = function() {
          step += 1;
          $("#run_check_plugin div.bar").css("width", step * 5 + "%");
          if (step < 20) {
            return setTimeout(updateTimer, step * steps);
          }
        };
        $("#run_check_plugin div.progress").show();
        bar = $("#run_check_plugin div.bar");
        step = 0;
        steps = (plugin_execution_time / 20) * 100;
        updateTimer();
      }
      $.getJSON(BASE_URL + "rest/pynag/json/run_check_command", {
        object_id: id
      }, function(data) {
        var statusLabel, statusString;
        statusLabel = "label-inverse";
        statusString = "Unknown";
        if (object_type === "host") {
          if (data[0] > 1) {
            statusLabel = "label-important";
            statusString = "DOWN";
          } else {
            statusLabel = "label-success";
            statusString = "UP";
          }
        } else {
          if (data[0] === 2) {
            statusLabel = "label-important";
            statusString = "Critical";
          }
          if (data[0] === 1) {
            statusLabel = "label-warning";
            statusString = "Warning";
          }
          if (data[0] === 0) {
            statusLabel = "label-success";
            statusString = "OK";
          }
        }
        $("#run_check_plugin #state").addClass(statusLabel);
        $("#run_check_plugin #state").html(statusString);
        if (data[1]) {
          $("#run_check_plugin div#output pre").text(data[1]);
        } else {
          $("#run_check_plugin #output pre").html("No data received on stdout");
        }
        if (data[2]) {
          $("#run_check_plugin #error pre").text(data[2]);
          $("#run_check_plugin div#error").show();
        }
        $("#run_check_plugin_refresh").show();
        $("#run_check_plugin div.progress").hide();
        return $("#run_check_plugin_refresh").click(function() {
          return $(this).adagios_ob_run_check_command();
        });
      }).error(function(jqXHR) {
        return alert("Failed to fetch data: URL: \"" + this.url + "\" Server Status: \"" + jqXHR.status + "\" Status: \"" + jqXHR.statusText + "\"");
      });
      return this;
    };
  })(jQuery);

  $(document).ready(function() {
    $("[rel=tooltip]").popover();
    $("#popover").popover();
    $("select").chosen();
    return $('button[data-dismiss="alert"]').on('click', function(e) {
      var $this, id;
      $this = $(this);
      id = $this.attr('data-notification-dismiss');
      if (id) {
        $.post("" + BASE_URL + "rest/adagios/txt/clear_notification", {
          notification_id: id
        }, function(data) {
          if (data === "success") {
            return $('span#num_notifications').each(function() {
              var num;
              num = +$(this).text();
              return $(this).text(+num - 1);
            });
          } else {
            return alert("Unable to dismiss notification for " + id);
          }
        });
      }
      return true;
    });
  });

}).call(this);
