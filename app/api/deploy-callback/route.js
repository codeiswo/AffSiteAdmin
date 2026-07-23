import { NextResponse } from 'next/server';
import { getMgrSetting, updateSite, addDeployLog } from '@/lib/db';

export const runtime = 'edge';

export async function POST(request) {
  try {
    const { site_id, status, secret } = await request.json();

    if (!site_id || !status || !secret) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 验证秘密 Token 是否匹配管理员密码
    const adminPassword = await getMgrSetting('admin_password');
    if (secret !== (adminPassword || 'dl0101')) {
      return NextResponse.json({ error: 'Unauthorized callback signature' }, { status: 403 });
    }

    // 验证状态
    if (status !== 'success' && status !== 'failed') {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const siteId = parseInt(site_id);
    
    // 更新状态并记入部署日志
    await updateSite(siteId, { deploy_status: status });
    await addDeployLog(
      siteId,
      'github_callback',
      status === 'success' ? 'success' : 'error',
      `GitHub Actions build callback received: Deployment marked as ${status.toUpperCase()}.`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Deploy callback error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
