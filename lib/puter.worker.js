const PROJECTS_PREFIX = 'roomify_project_';

const jsonError = (status, message, extra = {}) => {
    return new Response(JSON.stringify({error: message, ...extra}), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Accept-Control-Allow-Origin': '*'
        }
    })
};

const getUserId = async (userPuter) => {
    try {
        const user = await userPuter.getUser();
        return user?.uuid || null;
    } catch {
        return null;
    }
}


router.post('/api/projects/save', async ({request, user}) => {
    try{
        const userPuter = user.puter;
        if (!userPuter) {
            return jsonError(401, 'Authentication failed');
        }
        const body = await request.json();
        const project = body?.project;
        if(!project?.id || !project?.sourceImage) {
            return jsonError(400, 'Project ID and source image are required');
        }

        const payload = {
            ...project,
            updatedAt: new Date().toISOString()
        }

        const userID = await getUserId(userPuter);
        if (!userID) {
            return jsonError(401, 'Authentication failed');
        }
        const key = `${PROJECTS_PREFIX}${project.id}`;
        await userPuter.kv.set(key, payload);

        return {saved: true, id: project.id, project: payload};
    } catch (e) {
        return jsonError(500, 'Failed to save project', {message: e.message || 'Unknown error'});
    }
})

router.get('/api/projects/list', async ({user}) => {
    try {
        const userPuter = user.puter;
        if (!userPuter || !(await getUserId(userPuter))) {
            return jsonError(401, 'Authentication failed');
        }

        const projects = (await userPuter.kv.list(PROJECTS_PREFIX, true))
            .map(({value}) => ({...value, isPublic: true}))

        return {projects};
    } catch (e) {
        return jsonError(500, 'Failed to list projects', {message: e.message || 'Unknown error'});
    }
})

router.get('/api/projects/get', async ({request, user}) => {
    try {
        const userPuter = user.puter;
        if (!userPuter || !(await getUserId(userPuter))) {
            return jsonError(401, 'Authentication failed');
        }

        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return jsonError(400, 'Project ID is required');
        }

        const key = `${PROJECTS_PREFIX}${id}`;
        const project = await userPuter.kv.get(key);

        if (!project) {
            return jsonError(404, 'Project not found');
        }

        return {project};
    } catch (e) {
        return jsonError(500, 'Failed to get project', {message: e.message || 'Unknown error'});
    }
})