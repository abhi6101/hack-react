import re
import sys

def main():
    file_path = 'd:/anti hired mix/fully-frontend-react/src/pages/AdminDashboard.jsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add State Variables
    state_injection = """    const [editingUser, setEditingUser] = useState(null);
    const [editingJob, setEditingJob] = useState(null);
    const [editingInterview, setEditingInterview] = useState(null);
    
    // View Toggles
    const [activeJobsView, setActiveJobsView] = useState('list');
    const [activeUsersView, setActiveUsersView] = useState('list');
    const [activeInterviewsView, setActiveInterviewsView] = useState('list');
    const [activeStudentsView, setActiveStudentsView] = useState('list');

    const ViewToggle = ({ activeView, setActiveView, formLabel, listLabel, formIcon, listIcon }) => (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            <button 
                className={`btn ${activeView === 'form' ? 'btn-primary' : 'btn-outline'}`} 
                onClick={() => setActiveView('form')}
                style={{ flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
                <i className={formIcon}></i> {formLabel}
            </button>
            <button 
                className={`btn ${activeView === 'list' ? 'btn-primary' : 'btn-outline'}`} 
                onClick={() => setActiveView('list')}
                style={{ flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
                <i className={listIcon}></i> {listLabel}
            </button>
        </div>
    );
"""
    content = content.replace("    const [editingUser, setEditingUser] = useState(null);\n    const [editingJob, setEditingJob] = useState(null);\n    const [editingInterview, setEditingInterview] = useState(null);", state_injection)

    # 2. Refactor Students Tab
    students_orig = """const renderStudentMonitor = () => (
        <div className="users-management-page animate-in">
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: '800', background: 'linear-gradient(135deg, #fff 30%, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                    Student Monitor
                </h2>
            </div>"""
    students_new = """const renderStudentMonitor = () => (
        <div className="users-management-page animate-in">
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: '800', background: 'linear-gradient(135deg, #fff 30%, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                    Student Monitor
                </h2>
            </div>
            <ViewToggle activeView={activeStudentsView} setActiveView={setActiveStudentsView} formLabel="Hide Monitor" listLabel="Show Monitor" formIcon="fas fa-eye-slash" listIcon="fas fa-eye" />
            
            {activeStudentsView === 'list' && ("""
            
    content = content.replace(students_orig, students_new)
    
    # Close students block
    students_end_orig = """                        </table>
                    </div>
                )}
            </section>
        </div>
    );"""
    students_end_new = """                        </table>
                    </div>
                )}
            </section>
            )}
        </div>
    );"""
    content = content.replace(students_end_orig, students_end_new)

    # 3. Refactor Jobs Tab
    jobs_start_orig = """            case 'jobs':
                return (
                    <>
                        <section id="jobs-section" className="card surface-glow">"""
    
    jobs_start_new = """            case 'jobs':
                return (
                    <>
                        <ViewToggle activeView={activeJobsView} setActiveView={setActiveJobsView} formLabel="Post New Job" listLabel="View Posted Jobs" formIcon="fas fa-plus-circle" listIcon="fas fa-briefcase" />
                        {activeJobsView === 'form' && (
                        <section id="jobs-section" className="card surface-glow">"""
    content = content.replace(jobs_start_orig, jobs_start_new)

    # Wrap the jobs grid
    jobs_mid_orig = """                            </form>
                        </section>

                        <div className="dashboard-grid">"""
    jobs_mid_new = """                            </form>
                        </section>
                        )}

                        {activeJobsView === 'list' && (
                        <div className="dashboard-grid">"""
    content = content.replace(jobs_mid_orig, jobs_mid_new)

    # End jobs grid
    jobs_end_orig = """                            </div>
                        </div>
                    </>
                );"""
    jobs_end_new = """                            </div>
                        </div>
                        )}
                    </>
                );"""
    content = content.replace(jobs_end_orig, jobs_end_new)

    # 4. Refactor Users Tab
    users_start_orig = """            case 'users': {
                const filteredUsers = users.filter(user => {
                    if (role === 'DEPT_ADMIN') {
                        const myBranch = localStorage.getItem('adminBranch');
                        return user.role === 'USER' && user.branch === myBranch;
                    }
                    return true;
                });

                return (
                    <div className="users-management-page animate-in">
                        {!isCompanyAdmin && (
                            <section className="card surface-glow-premium" style={{ marginBottom: '2.5rem', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>"""
    users_start_new = """            case 'users': {
                const filteredUsers = users.filter(user => {
                    if (role === 'DEPT_ADMIN') {
                        const myBranch = localStorage.getItem('adminBranch');
                        return user.role === 'USER' && user.branch === myBranch;
                    }
                    return true;
                });

                return (
                    <div className="users-management-page animate-in">
                        {!isCompanyAdmin && <ViewToggle activeView={activeUsersView} setActiveView={setActiveUsersView} formLabel="Onboard New User" listLabel="Registered Workforce" formIcon="fas fa-user-plus" listIcon="fas fa-users" />}
                        {activeUsersView === 'form' && !isCompanyAdmin && (
                            <section className="card surface-glow-premium" style={{ marginBottom: '2.5rem', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>"""
    content = content.replace(users_start_orig, users_start_new)

    users_mid_orig = """                                </div>
                            </section>
                        )}

                        <section className="card surface-glow" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>"""
    users_mid_new = """                                </div>
                            </section>
                        )}

                        {(activeUsersView === 'list' || isCompanyAdmin) && (
                        <section className="card surface-glow" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>"""
    content = content.replace(users_mid_orig, users_mid_new)

    users_end_orig = """                            </div>
                        </section>
                    </div>
                );
            }
            case 'applications':"""
    users_end_new = """                            </div>
                        </section>
                        )}
                    </div>
                );
            }
            case 'applications':"""
    content = content.replace(users_end_orig, users_end_new)

    # 5. Refactor Interviews Tab
    interviews_start_orig = """            case 'interviews':
                return (
                    <>
                        {!isCompanyAdmin && (
                            <section className="card surface-glow">"""
    interviews_start_new = """            case 'interviews':
                return (
                    <>
                        {!isCompanyAdmin && <ViewToggle activeView={activeInterviewsView} setActiveView={setActiveInterviewsView} formLabel="Post New Interview" listLabel="Manage Interviews" formIcon="fas fa-calendar-plus" listIcon="fas fa-calendar-alt" />}
                        {activeInterviewsView === 'form' && !isCompanyAdmin && (
                            <section className="card surface-glow">"""
    content = content.replace(interviews_start_orig, interviews_start_new)

    interviews_mid_orig = """                                </div>
                            </section>
                        )}

                        <div className="dashboard-grid">"""
    interviews_mid_new = """                                </div>
                            </section>
                        )}

                        {(activeInterviewsView === 'list' || isCompanyAdmin) && (
                        <div className="dashboard-grid">"""
    content = content.replace(interviews_mid_orig, interviews_mid_new)

    interviews_end_orig = """                            </div>
                        </div>
                    </>
                );"""
    interviews_end_new = """                            </div>
                        </div>
                        )}
                    </>
                );"""
    content = content.replace(interviews_end_orig, interviews_end_new)


    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        print("Refactor complete!")

if __name__ == '__main__':
    main()
