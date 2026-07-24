/**
 * Cloudflare API Client for AffSite
 * Integrates D1 Databases, Pages Projects, Custom Domains, and Email Routing.
 */

// Helper to handle fetch responses and errors
async function handleResponse(res, errorMessage) {
  if (!res.ok) {
    const text = await res.text();
    let detail = text;
    try {
      const json = JSON.parse(text);
      if (json.errors && json.errors.length > 0) {
        detail = json.errors.map(e => `${e.message} (code: ${e.code})`).join(', ');
      }
    } catch (_) {}
    throw new Error(`${errorMessage}: ${res.statusText} (${res.status}) - ${detail}`);
  }
  return await res.json();
}

/**
 * 1. 创建 D1 数据库
 */
export async function createD1Database(apiToken, accountId, dbName) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: dbName }),
  });
  const data = await handleResponse(res, 'Failed to create D1 database');
  return {
    databaseId: data.result.uuid,
    name: data.result.name,
  };
}

/**
 * 2. 在 D1 数据库执行 SQL 查询 (支持单条或多条语句以分号分隔)
 */
export async function executeSQLOnD1(apiToken, accountId, databaseId, sqlString, params = []) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
  const bodyPayload = { sql: sqlString };
  if (params && params.length > 0) {
    bodyPayload.params = params;
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyPayload),
  });
  const data = await handleResponse(res, 'Failed to execute SQL queries on D1');
  return data.result;
}

/**
 * 3. 创建 Pages 项目
 */
export async function createPagesProject(apiToken, accountId, projectName) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName,
      production_branch: 'main',
    }),
  });
  const data = await handleResponse(res, 'Failed to create Pages project');
  return data.result;
}

/**
 * 4. 给 Pages 项目配置 D1 绑定、兼容日期和兼容标志
 */
export async function configurePagesProjectBindings(apiToken, accountId, projectName, databaseId) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`;
  const configPayload = {
    deployment_configs: {
      production: {
        d1_databases: {
          DB: {
            id: databaseId,
          },
        },
        compatibility_date: '2024-09-23',
        compatibility_flags: ['nodejs_compat'],
      },
      preview: {
        d1_databases: {
          DB: {
            id: databaseId,
          },
        },
        compatibility_date: '2024-09-23',
        compatibility_flags: ['nodejs_compat'],
      },
    },
  };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(configPayload),
  });
  const data = await handleResponse(res, 'Failed to configure D1 binding on Pages project');
  return data.result;
}

/**
 * 5. 为 Pages 项目绑定自定义域名
 */
export async function bindPagesDomain(apiToken, accountId, projectName, domainName) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/domains`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: domainName }),
  });
  if (!res.ok) {
    const text = await res.text();
    if (text.includes('already exists') || text.includes('8000018')) {
      console.log(`Domain ${domainName} is already bound to Pages project ${projectName}.`);
      return { name: domainName };
    }
    let detail = text;
    try {
      const json = JSON.parse(text);
      if (json.errors && json.errors.length > 0) {
        detail = json.errors.map(e => `${e.message} (code: ${e.code})`).join(', ');
      }
    } catch (_) {}
    throw new Error(`Failed to bind domain to Pages project: ${res.statusText} (${res.status}) - ${detail}`);
  }
  const data = await res.json();
  return data.result;
}

/**
 * 5.5 触发 Pages 项目域名的即时 DNS / SSL 校验
 */
export async function triggerPagesDomainValidation(apiToken, accountId, projectName, domainName) {
  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/domains/${domainName}`;
    await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
  } catch (e) {
    console.log('Pages domain validation trigger note:', e.message);
  }
}

/**
 * 6. 获取域名的 Zone ID
 */
export async function getZoneIdByDomain(apiToken, domainName) {
  // 提取二级根域名 (如 sub.domain.com -> domain.com)
  const parts = domainName.split('.');
  const rootDomain = parts.slice(-2).join('.');

  const url = `https://api.cloudflare.com/client/v4/zones?name=${rootDomain}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await handleResponse(res, 'Failed to find Cloudflare Zone for domain');
  if (!data.result || data.result.length === 0) {
    throw new Error(`No Cloudflare zone found for root domain: ${rootDomain}`);
  }
  return data.result[0].id;
}

/**
 * 6.5 创建或更新 Cloudflare DNS 解析记录 (如 CNAME 记录)
 */
export async function createOrUpdateDNSRecord(apiToken, zoneId, recordType, name, content, proxied = true) {
  const listUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=${recordType}&name=${name}`;
  const listRes = await fetch(listUrl, {
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });
  const listData = await listRes.json();
  const existing = listData.result && listData.result.length > 0 ? listData.result[0] : null;

  if (existing) {
    if (existing.content === content && existing.proxied === proxied) {
      return existing;
    }
    const updateUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${existing.id}`;
    const updateRes = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: recordType,
        name,
        content,
        proxied,
        ttl: 1
      }),
    });
    const updateData = await handleResponse(updateRes, `Failed to update DNS record ${name}`);
    return updateData.result;
  } else {
    const createUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: recordType,
        name,
        content,
        proxied,
        ttl: 1
      }),
    });
    const createData = await handleResponse(createRes, `Failed to create DNS record ${name}`);
    return createData.result;
  }
}

/**
 * 7. 开通并配置 Email Routing (邮件路由转发规则)
 */
export async function setupEmailForwarding(apiToken, zoneId, targetDomain, forwardingEmail) {
  // A. 尝试启用邮件路由 (如果报错已启用，可以忽略)
  try {
    const enableUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/email/routing/enable`;
    await fetch(enableUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.log('Email routing enable check (might already be enabled):', err.message);
  }

  // B. 查询现有规则，避免重复创建或更新已有规则
  const rulesUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/email/routing/rules`;
  const listRes = await fetch(rulesUrl, {
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });
  const listData = await listRes.json();
  const rules = listData.result || [];

  const targetAddress = `info@${targetDomain}`;
  const existingRule = rules.find(r => 
    r.matchers && r.matchers.some(m => m.field === 'to' && m.value === targetAddress)
  );

  const rulePayload = {
    name: `AffSite Auto Forward - ${targetDomain}`,
    enabled: true,
    matchers: [
      {
        type: 'literal',
        field: 'to',
        value: targetAddress,
      },
    ],
    actions: [
      {
        type: 'forward',
        value: [forwardingEmail],
      },
    ],
  };

  if (existingRule) {
    const updateUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/email/routing/rules/${existingRule.id}`;
    const updateRes = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rulePayload),
    });
    const data = await handleResponse(updateRes, 'Failed to update Email Routing forward rule');
    return data.result;
  } else {
    const createRes = await fetch(rulesUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rulePayload),
    });
    const data = await handleResponse(createRes, 'Failed to setup Email Routing forward rule');
    return data.result;
  }
}

/**
 * 8. 删除 Pages 项目
 */
export async function deletePagesProject(apiToken, accountId, projectName) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await handleResponse(res, 'Failed to delete Pages project');
  return data.result;
}

/**
 * 9. 删除 D1 数据库
 */
export async function deleteD1Database(apiToken, accountId, databaseId) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await handleResponse(res, 'Failed to delete D1 database');
  return data.result;
}
