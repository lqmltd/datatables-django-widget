// Trigger all tooltips

let tooltipList;

function initialiseTooltips() {
  let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })
}

function disposeTooltips() {
  tooltipList.forEach((tooltip) => {tooltip.dispose()});
}

initialiseTooltips();
