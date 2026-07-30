import request from './request'

export function getExpensesApi(params) {
  return request({
    url: '/api/expenses',
    method: 'get',
    params: cleanQuery(params)
  })
}

export function getExpenseSummaryApi(params) {
  return request({
    url: '/api/expenses/summary',
    method: 'get',
    params: cleanQuery(params)
  })
}

export function createExpenseApi(data) {
  return request({
    url: '/api/expenses',
    method: 'post',
    data
  })
}

function cleanQuery(params) {
  const query = { ...params }
  Object.keys(query).forEach((key) => {
    const value = query[key]
    if (value === '' || value === null || value === undefined) {
      delete query[key]
    }
  })
  return query
}
