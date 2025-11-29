import { UserSummary } from "../interfaces/ui_ready_interfaces.tsx/effect_interfaces";


export default function UserSummaryList({ user_summaries }: { user_summaries: UserSummary[] }) {
  return (
    <div className="space-y-4">
      {user_summaries.map((user, index) => (
        <div key={index} className="p-4 rounded-lg border border-gray-700 bg-gray-900 text-white">
          
          {/* User header */}
          <h2 className="text-lg font-semibold mb-2">
            {user.username}{" "}
            <span className="text-gray-400 text-sm">({user.useraddress})</span>
          </h2>

          {/* Changes list */}
          <ul className="space-y-1">
            {user.changes?.map((change, cIndex) => (
              <li key={cIndex} className="text-sm">
                <span className="font-bold uppercase text-blue-400">
                  {change.action}
                </span>{" "}
                → 
                <code className="text-yellow-300 ml-1">{change.objectAddress}</code>

                {change.targetUser && (
                  <>
                    {" "}
                    → <span className="italic text-green-300">{change.targetUser}</span>
                  </>
                )}
              </li>
            ))}
          </ul>

        </div>
      ))}
    </div>
  );
}