export const ModulePermission = {
  dashboard: {
    view: '101011',
  },
  companies: {
    delete: "121014",
    create: "121012",
    view: "121011",
    update: "121013"
  },
  alerts: {
    create: "151012",
    update: "151013",
    delete: "151014",
    view: "151011"
  },
  command_library: {
    view: "171011",
    create: "171012",
    update: "171013",
    delete: "171014"
  },
  command_reference: {
    view: "161011",
    create: "161012",
    update: "161013",
    delete: "161014"
  },
  settings: {
    permissions: {
      view: '111011',
      update: '111013',
      create: '111012',
      delete: '111014',
    },
  },
  employees: {
    create: "141012",
    delete: "141014",
    view: "141011",
    update: "141013",
    all_employees: {
      view: "141111",
      create: "141112",
      update: "141113",
      delete: "141114"
    },
    bulk_uploaded_employees: {
      create: "141212",
      view: "141211",
      delete: "141214",
      update: "141213"
    }
  },
  servers: {
    development: {
      update: "131013",
      view: "131011",
      create: "131012",
      delete: "131014"
    },
    staging: {
      create: "131112",
      update: "131113",
      delete: "131114",
      view: "131111"
    },
    main: {
      view: "131211",
      create: "131212",
      delete: "131214",
      update: "131213"
    }
  }

  // vehicles: {
  //   parked_vehicles: {
  //     update: '111013',
  //     create: '111012',
  //     delete: '111014',
  //     view: '111011',
  //   },
  // },
  // settings: {
  //   permissions: {
  //     view: '161011',
  //     update: '161013',
  //     create: '161012',
  //     delete: '161014',
  //   },
  // },
  // qr_codes: {
  //   lost_qr_code: {
  //     view: '131111',
  //     delete: '131114',
  //     create: '131112',
  //     update: '131113',
  //   },
  //   qr_code: {
  //     create: '131012',
  //     update: '131013',
  //     view: '131011',
  //     delete: '131014',
  //   },
  // },
  // services: {
  //   service: {
  //     create: '141012',
  //     delete: '141014',
  //     view: '141011',
  //     update: '141013',
  //   },
  //   service_request: {
  //     create: '141112',
  //     view: '141111',
  //     delete: '141114',
  //     update: '141113',
  //   },
  // },
  // users: {
  //   drivers: {
  //     create: '121112',
  //     delete: '121114',
  //     update: '121113',
  //     view: '121111',
  //   },
  //   users_list: {
  //     view: '121011',
  //     create: '121012',
  //   },
  // },
};
